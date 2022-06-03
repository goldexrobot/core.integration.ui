package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

var (
	_                 = API(&Impl{})
	errNonOperational = errors.New("module is non-operational")
	errBusy           = errors.New("busy, call later")
)

// API implementation
type Impl struct {
	logger *logrus.Entry
	mod    Moduler
	hw     Hardwarer

	mu        sync.Mutex
	busy      bool
	evalState evalState
	evalCell  string
}

type evalState int

const (
	evalInitial evalState = iota + 1
	evalNewCreated
	evalInletOpened
	evalInletClosed
	evalSpectrumFinishedRejection
	evalSpectrumFinishedSuccess
	evalHydroFinishedRejection
	evalHydroFinishedSuccess
	evalOutletOpened
)

// Provides interaction with parent software module
type Moduler interface {
	// Checks parent module is operational
	Operational() (ok bool)
	// Called on critical hardware errors
	Broken(err error)
}

// Communicates hardware and network services
type Hardwarer interface {
	OpenInlet(ctx context.Context) (err error)
	CloseInlet(ctx context.Context) (err error)
	CloseOutlet(ctx context.Context) (err error)

	NewEval(ctx context.Context) (evalID uint64, cell string, netFail, noRoom, hwFail bool, err error)
	SpectralEval(ctx context.Context) (eval ImplSpectralData, netFail bool, rejected string, err error)
	HydroEval(ctx context.Context) (eval ImplHydroData, netFail bool, rejected string, unstableScale bool, err error)
	FinalizeEval(ctx context.Context) (fineness ImplFinenessData, netFail bool, rejected string, err error)
	ReturnAfterSpectrumEval(ctx context.Context, customerChoice bool) (err error)
	ReturnAfterHydroEval(ctx context.Context, customerChoice bool) (err error)
	StoreAfterHydroEval(ctx context.Context) (cell string, err error)

	ExtractCellFromStorage(ctx context.Context, cell string) (err error)
	StorageOccupyCell(ctx context.Context, cell, domain, tx string) (netFail, forbidden bool, err error)
	StorageReleaseCell(ctx context.Context, cell, domain, tx string) (netFail, forbidden bool, err error)

	ProxyBusinessRequest(ctx context.Context, endpoint string, body map[string]interface{}) (httpStatus int, response map[string]interface{}, err error)

	OptionalHardwareHealth(ctx context.Context) (health map[string]bool, err error)
	OptionalHardwareMethod(ctx context.Context, module, method string, request json.RawMessage) (result json.RawMessage, err error)

	UploadFrontalCameraPhotoForEval(ctx context.Context)

	BotIdentity(ctx context.Context) (projectID, botID uint64, err error)
	InternetConnectivity(ctx context.Context) (ok bool)
	HasStorage(ctx context.Context) (ok bool)
	HasPositionalStorage(ctx context.Context) (ok bool)
}

type ImplSpectralData struct {
	Alloy      string
	Purity     float64
	Millesimal int
	Carat      string
	Spectrum   map[string]float64
}

type ImplHydroData struct {
	DryWeight float64
	WetWeight float64
}

type ImplFinenessData struct {
	Alloy      string
	Purity     float64
	Millesimal int
	Carat      string
	Weight     float64
	Confidence float64
	Risky      bool
	Warnings   []string
}

func NewImpl(mod Moduler, hw Hardwarer, logger *logrus.Entry) *Impl {
	return &Impl{
		logger:    logger,
		mod:       mod,
		hw:        hw,
		evalState: evalInitial,
	}
}

func (a *Impl) check() (err error) {
	if !a.mod.Operational() {
		err = errNonOperational
		return
	}
	return nil
}

func (a *Impl) lock() (err error) {
	// check/set busy
	a.mu.Lock()
	if a.busy {
		err = errBusy
	} else {
		a.busy = true
	}
	a.mu.Unlock()
	return
}

func (a *Impl) unlock() {
	a.mu.Lock()
	a.busy = false
	a.mu.Unlock()
}

func (a *Impl) setModuleBroken(err error) error {
	a.logger.WithError(err).Errorf("Fatal hardware error is occurred")
	a.mod.Broken(err)
	return fmt.Errorf("terminal is broken")
}

////// INLET/OUTLET WINDOW /////

// Requires hardware to open inlet window. Should be called to receive a customer item before evaluation.
func (a *Impl) InletOpen(ctx context.Context) (err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalNewCreated {
		err = fmt.Errorf("invalid state: first start a new evaluation")
		return
	}
	if err = a.hw.OpenInlet(ctx); err != nil {
		return a.setModuleBroken(err)
	}
	a.evalState = evalInletOpened
	return
}

// Requires hardware to close inlet window. Should be called right before evaluation launch.
func (a *Impl) InletClose(ctx context.Context) (err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalInletOpened {
		err = fmt.Errorf("invalid state: first open inlet")
		return
	}
	if err = a.hw.CloseInlet(ctx); err != nil {
		return a.setModuleBroken(err)
	}
	a.evalState = evalInletClosed
	return
}

// Requires hardware to close outlet window. Should be called manually after customer item return or storage item extraction.
func (a *Impl) OutletClose(ctx context.Context) (err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalOutletOpened {
		err = fmt.Errorf("invalid state: outlet is not opened")
		return
	}
	if err = a.hw.CloseOutlet(ctx); err != nil {
		return a.setModuleBroken(err)
	}
	a.evalState = evalInitial
	return
}

///// EVALUATION //////

// Prepares a new evaluation operation: check hardware, notify backend server, etc.
func (a *Impl) EvalNew(ctx context.Context) (res EvalNewResult, err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalInitial && a.evalState != evalNewCreated && a.evalState != evalInletClosed {
		err = fmt.Errorf("can't start a new evaluation right now")
		return
	}

	evalID, storageCell, netFail, failNoRoom, failHW, err := a.hw.NewEval(ctx)
	if err != nil {
		err = a.setModuleBroken(err)
		return
	}

	switch {
	case netFail:
		return EvalNewResultFailure{
			Failure: EvalNewResultFailureFailureNetworkUnavailable,
		}, nil
	case failNoRoom:
		return EvalNewResultFailure{
			Failure: EvalNewResultFailureFailureNoStorageRoom,
		}, nil
	case failHW:
		return EvalNewResultFailure{
			Failure: EvalNewResultFailureFailureHardwareCheckFailed,
		}, nil
	}

	// customer photo
	a.hw.UploadFrontalCameraPhotoForEval(ctx)

	a.evalState = evalNewCreated
	a.evalCell = storageCell

	return EvalNewResultSuccess{
		EvalId:      evalID,
		StorageCell: storageCell,
		Success:     true,
	}, nil
}

// Starts a spectral evaluation of the item. Should be called right after `eval.new`.
// On successful spectral evaluation the item might be returned back to customer with `eval.return`, otherwise the evaluation should be continued with `eval.hydro`.
func (a *Impl) EvalSpectrum(ctx context.Context) (res EvalSpectrumResult, err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalInletClosed {
		err = fmt.Errorf("invalid state: first close inlet")
		return
	}

	eval, netFail, rejection, err := a.hw.SpectralEval(ctx)
	if err != nil {
		err = a.setModuleBroken(err)
		return
	}

	a.evalState = evalSpectrumFinishedRejection
	switch {
	case netFail:
		return EvalSpectrumResultFailure{
			Failure: EvalSpectrumResultFailureFailureNetworkUnavailable,
		}, nil
	case rejection != "":
		return EvalSpectrumResultFailure{
			Failure: EvalSpectrumResultFailureFailureItemRejected,
			Reason:  ItemRejectionReason(rejection),
		}, nil
	}

	a.evalState = evalSpectrumFinishedSuccess
	return EvalSpectrumResultSuccess{
		Success:    true,
		Alloy:      eval.Alloy,
		Purity:     eval.Purity,
		Millesimal: int64(eval.Millesimal),
		Carat:      eval.Carat,
		Spectrum:   eval.Spectrum,
	}, nil
}

// Starts a hydrostatic evaluation of the item. Should be called right after `eval.spectrum`.
// On successful hydrostatic evaluation the item might be returned back to customer with `eval.return`.
func (a *Impl) EvalHydro(ctx context.Context) (res EvalHydroResult, err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalSpectrumFinishedSuccess {
		err = fmt.Errorf("invalid state: can't start hydrostatic evaluation after rejection by spectrum")
		return
	}

	eval, netFail, rejection, unstableScale, err := a.hw.HydroEval(ctx)
	if err != nil {
		err = a.setModuleBroken(err)
		return
	}

	a.evalState = evalHydroFinishedRejection

	switch {
	case netFail:
		return EvalHydroResultFailure{
			Failure: EvalHydroResultFailureFailureNetworkUnavailable,
		}, nil
	case unstableScale:
		return EvalHydroResultFailure{
			Failure: EvalHydroResultFailureFailureUnstableScale,
		}, nil
	case rejection != "":
		return EvalHydroResultFailure{
			Failure: EvalHydroResultFailureFailureEvalRejected,
			Reason:  ItemRejectionReason(rejection),
		}, nil
	}

	// call backend to finalize eval
	fineness, netFail, rejection, xerr := a.hw.FinalizeEval(ctx)
	if xerr != nil {
		err = a.setModuleBroken(xerr)
		return
	}

	switch {
	case netFail:
		return EvalHydroResultFailure{
			Failure: EvalHydroResultFailureFailureNetworkUnavailable,
		}, nil
	case rejection != "":
		return EvalHydroResultFailure{
			Failure: EvalHydroResultFailureFailureEvalRejected,
			Reason:  ItemRejectionReason(rejection),
		}, nil
	}

	a.evalState = evalHydroFinishedSuccess

	return EvalHydroResultSuccess{
		Success:    true,
		Alloy:      fineness.Alloy,
		Purity:     fineness.Purity,
		Millesimal: int64(fineness.Millesimal),
		Carat:      fineness.Carat,
		Weight:     eval.DryWeight,
		Confidence: fineness.Confidence,
		Risky:      fineness.Risky,
		Warnings:   fineness.Warnings,
	}, nil
}

// Starts a returning process of the item. Should be called after spectral/hydrostatic evaluation.
// On successful returning outlet window should be closed manually: customer choice (preferred) or a timeout.
func (a *Impl) EvalReturn(ctx context.Context) (err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	switch a.evalState {
	case evalSpectrumFinishedSuccess, evalSpectrumFinishedRejection:
		err = a.hw.ReturnAfterSpectrumEval(ctx, a.evalState == evalSpectrumFinishedSuccess)
		if err != nil {
			return a.setModuleBroken(err)
		}
		a.evalState = evalOutletOpened
	case evalHydroFinishedSuccess, evalHydroFinishedRejection:
		err = a.hw.ReturnAfterHydroEval(ctx, a.evalState == evalHydroFinishedSuccess)
		if err != nil {
			return a.setModuleBroken(err)
		}
		a.evalState = evalOutletOpened
	default:
		err = fmt.Errorf("invalid state: call return only after spectral or hydrostatic evaluation")
	}

	return
}

// Requires hardware to transfer successfully evaluated item into the internal storage.
func (a *Impl) EvalStore(ctx context.Context, req EvalStoreRequest) (res EvalStoreResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalHydroFinishedSuccess && a.evalState != evalHydroFinishedRejection {
		err = fmt.Errorf("invalid state: store the item only after hydrostatic evaluation")
		return
	}

	tx := strings.ReplaceAll(uuid.NewString(), "-", "")

	// occupy on backend side
	netFail, forbidden, err := a.hw.StorageOccupyCell(ctx, a.evalCell, string(req.Domain), tx)
	if err != nil {
		err = a.setModuleBroken(err)
		return
	}

	switch {
	case netFail:
		return EvalStoreResultFailure{
			Failure: EvalStoreResultFailureFailureNetworkUnavailable,
		}, nil
	case forbidden:
		return EvalStoreResultFailure{
			Failure: EvalStoreResultFailureFailureForbidden,
		}, nil
	}

	cell, err := a.hw.StoreAfterHydroEval(ctx)
	if err != nil {
		_ = a.setModuleBroken(err)
	}

	a.evalState = evalInitial

	res = EvalStoreResultSuccess{
		Success:     true,
		Cell:        cell,
		Transaction: tx,
	}
	return
}

////// STORAGE //////

// Requires hardware to extract an item from the specified storage cell and bring it to the outlet window.
// On successful extraction the outlet window should be closed manually: customer choice (preferred) or a timeout.
func (a *Impl) StorageExtract(ctx context.Context, req StorageExtractRequest) (res StorageExtractResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	if a.evalState != evalInitial && a.evalState != evalNewCreated && a.evalState != evalInletClosed {
		err = fmt.Errorf("invalid state: can't do it during evaluation")
		return
	}

	tx := strings.ReplaceAll(uuid.NewString(), "-", "")

	// occupy on backend side
	netFail, forbidden, err := a.hw.StorageReleaseCell(ctx, req.Cell, string(req.Domain), tx)
	if err != nil {
		err = a.setModuleBroken(err)
		return
	}

	switch {
	case netFail:
		return StorageExtractResultFailure{
			Failure: NetworkUnavailable,
		}, nil
	case forbidden:
		return StorageExtractResultFailure{
			Failure: Forbidden,
		}, nil
	}

	if err = a.hw.ExtractCellFromStorage(ctx, req.Cell); err != nil {
		_ = a.setModuleBroken(err)
	}

	a.evalState = evalOutletOpened

	res = StorageExtractResultSuccess{
		Success:     true,
		Transaction: tx,
	}
	return
}

////// OTHER //////

// Checks the internet connection and custom hardware modules are available.
func (a *Impl) Status(ctx context.Context) (res StatusResult, err error) {
	oh, err := a.hw.OptionalHardwareHealth(ctx)
	if err != nil {
		return
	}
	
	projectID, botID, err := a.hw.BotIdentity(ctx)
	if err != nil {
		return
	}

	res = StatusResult{
		ProjectId:          projectID,
		BotId:              botID,
		Operational:        a.mod.Operational(),
		InternetConnection: a.hw.InternetConnectivity(ctx),
		OptionalHardware:   oh,
		Features: StatusResultFeatures{
			Storage:           a.hw.HasStorage(ctx),
			PositionalStorage: a.hw.HasPositionalStorage(ctx),
		},
	}
	return
}

// Performs a call to a named backend method defined in Goldex dashboard.
func (a *Impl) Proxy(ctx context.Context, req ProxyRequest) (res ProxyResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	httpStatus, response, err := a.hw.ProxyBusinessRequest(ctx, req.Endpoint, req.Body)
	if err != nil {
		return
	}
	res = ProxyResult{
		HttpStatus: int64(httpStatus),
		Body:       response,
	}
	return
}

// Call an RPC method of the optional hardware installed within the terminal.
func (a *Impl) Hardware(ctx context.Context, req HardwareRequest) (res HardwareResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	kv, err := a.hw.OptionalHardwareMethod(ctx, req.Name, req.Method, req.Params)
	if err != nil {
		return
	}
	res = HardwareResult{
		Result: kv,
	}
	return
}

////// REQUEST VALIDATOR //////

func newValidator() *validator.Validate {
	v := validator.New()
	return v
}
