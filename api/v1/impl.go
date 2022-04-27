package api

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

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

// Provides interaction with parent module
type Moduler interface {
	// Checks parent module is operational
	Operational() (ok bool)
	// Called on critical hardware errors
	Broken(err error)
}

// Communicates hardware and network services
type Hardwarer interface {
	OpenInlet() (err error)
	CloseInlet() (err error)
	CloseOutlet() (err error)

	NewEval() (evalID uint64, cell string, netFail, noRoom, hwFail bool, err error)
	SpectralEval() (eval ImplSpectralData, netFail bool, rejected string, err error)
	HydroEval() (eval ImplHydroData, netFail bool, rejected string, unstableScale bool, err error)
	FinalizeEval() (fineness ImplFinenessData, netFail bool, rejected string, err error)
	ReturnAfterSpectrumEval(customerChoice bool) (err error)
	ReturnAfterHydroEval(customerChoice bool) (err error)
	StoreAfterHydroEval() (cell string, err error)

	ExtractCellFromStorage(cell string) (err error)
	StorageOccupyCell(cell, domain, tx string) (netFail, forbidden bool, err error)
	StorageReleaseCell(cell, domain, tx string) (netFail, forbidden bool, err error)

	IntegrationUIMethod(method string, body map[string]interface{}) (httpStatus int, response map[string]interface{}, err error)

	OptionalHardwareHealth() (health map[string]bool, err error)
	OptionalHardwareMethod(module, method string, request interface{}) (result interface{}, err error)

	UploadFrontalCameraPhotoForEval()

	InternetConnectivity() (ok bool)
	HasStorage() (ok bool)
	HasPositionalStorage() (ok bool)
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

func (a *Impl) brokenProxy(err error) error {
	a.logger.WithError(err).Errorf("Fatal hardware error is occurred")
	a.mod.Broken(err)
	return fmt.Errorf("terminal is broken")
}

////// INLET/OUTLET WINDOW /////

// Requires hardware to open inlet window. Should be called to receive a customer item before evaluation.
func (a *Impl) InletOpen() (err error) {
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
	if err = a.hw.OpenInlet(); err != nil {
		return a.brokenProxy(err)
	}
	a.evalState = evalInletOpened
	return
}

// Requires hardware to close inlet window. Should be called right before evaluation launch.
func (a *Impl) InletClose() (err error) {
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
	if err = a.hw.CloseInlet(); err != nil {
		return a.brokenProxy(err)
	}
	a.evalState = evalInletClosed
	return
}

// Requires hardware to close outlet window. Should be called manually after customer item return or storage item extraction.
func (a *Impl) OutletClose() (err error) {
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
	if err = a.hw.CloseOutlet(); err != nil {
		return a.brokenProxy(err)
	}
	a.evalState = evalInitial
	return
}

///// EVALUATION //////

// Prepares a new evaluation operation: check hardware, notify backend server, etc.
func (a *Impl) EvalNew() (res EvalNewResult, err error) {
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

	evalID, storageCell, netFail, failNoRoom, failHW, err := a.hw.NewEval()
	if err != nil {
		err = a.brokenProxy(err)
		return
	}

	// customer photo
	a.hw.UploadFrontalCameraPhotoForEval()

	switch {
	case netFail, failNoRoom, failHW:
		res = EvalNewResult{
			Failure: &EvalNewResultFailure{
				NetworkUnavailable: netFail,
				HardwareCheck:      failHW,
				NoStorageRoom:      failNoRoom,
			},
		}
	default:
		a.evalState = evalNewCreated
		a.evalCell = storageCell
		res = EvalNewResult{
			Success: &EvalNewResultSuccess{
				EvalID:      evalID,
				StorageCell: storageCell,
			},
		}
	}
	return
}

// Starts a spectral evaluation of the item. Should be called right after `eval.new`.
// On successful spectral evaluation the item might be returned back to customer with `eval.return`, otherwise the evaluation should be continued with `eval.hydro`.
func (a *Impl) EvalSpectrum() (res EvalSpectrumResult, err error) {
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

	eval, netFail, rejection, err := a.hw.SpectralEval()
	if err != nil {
		err = a.brokenProxy(err)
		return
	}

	switch {
	case netFail, rejection != "":
		a.evalState = evalSpectrumFinishedRejection
		res = EvalSpectrumResult{
			Failure: &EvalSpectrumResultFailure{
				NetworkUnavailable: netFail,
				EvalRejected:       rejection != "",
				RejectionReason:    rejection,
			},
		}
	default:
		a.evalState = evalSpectrumFinishedSuccess
		res = EvalSpectrumResult{
			Success: &EvalSpectrumResultSuccess{
				Alloy:      eval.Alloy,
				Purity:     eval.Purity,
				Millesimal: eval.Millesimal,
				Carat:      eval.Carat,
				Spectrum:   eval.Spectrum,
			},
		}
	}

	return
}

// Starts a hydrostatic evaluation of the item. Should be called right after `eval.spectrum`.
// On successful hydrostatic evaluation the item might be returned back to customer with `eval.return`.
func (a *Impl) EvalHydro() (res EvalHydroResult, err error) {
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

	eval, netFail, rejection, unstableScale, err := a.hw.HydroEval()
	if err != nil {
		err = a.brokenProxy(err)
		return
	}

	switch {
	case netFail, rejection != "", unstableScale:
		a.evalState = evalHydroFinishedRejection
		res = EvalHydroResult{
			Failure: &EvalHydroResultFailure{
				NetworkUnavailable: netFail,
				EvalRejected:       rejection != "",
				UnstableScale:      unstableScale,
				RejectionReason:    rejection,
			},
		}
	default:
		// call backend to finalize eval
		fineness, netFail, rejection, xerr := a.hw.FinalizeEval()
		if xerr != nil {
			err = a.brokenProxy(xerr)
			return
		}
		switch {
		case netFail, rejection != "":
			a.evalState = evalHydroFinishedRejection
			res = EvalHydroResult{
				Failure: &EvalHydroResultFailure{
					NetworkUnavailable: netFail,
					EvalRejected:       rejection != "",
					RejectionReason:    rejection,
				},
			}
		default:
			a.evalState = evalHydroFinishedSuccess
			res = EvalHydroResult{
				Success: &EvalHydroResultSuccess{
					Alloy:      fineness.Alloy,
					Purity:     fineness.Purity,
					Millesimal: fineness.Millesimal,
					Carat:      fineness.Carat,
					Weight:     eval.DryWeight,
					Confidence: fineness.Confidence,
					Risky:      fineness.Risky,
					Warnings:   fineness.Warnings,
				},
			}
		}
	}

	return
}

// Starts a returning process of the item. Should be called after spectral/hydrostatic evaluation.
// On successful returning outlet window should be closed manually: customer choice (preferred) or a timeout.
func (a *Impl) EvalReturn() (err error) {
	if err = a.check(); err != nil {
		return
	}
	if err = a.lock(); err != nil {
		return
	}
	defer a.unlock()

	switch a.evalState {
	case evalSpectrumFinishedSuccess, evalSpectrumFinishedRejection:
		err = a.hw.ReturnAfterSpectrumEval(a.evalState == evalSpectrumFinishedSuccess)
		if err != nil {
			return a.brokenProxy(err)
		}
		a.evalState = evalOutletOpened
	case evalHydroFinishedSuccess, evalHydroFinishedRejection:
		err = a.hw.ReturnAfterHydroEval(a.evalState == evalHydroFinishedSuccess)
		if err != nil {
			return a.brokenProxy(err)
		}
		a.evalState = evalOutletOpened
	default:
		err = fmt.Errorf("invalid state: call return only after spectral or hydrostatic evaluation")
	}

	return
}

// Requires hardware to transfer successfully evaluated item into the internal storage.
func (a *Impl) EvalStore(req EvalStoreRequest) (res EvalStoreResult, err error) {
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

	// occupy on backend side (with multiple attempts)
	var (
		netFail   bool
		forbidden bool
	)
	for i := 0; i < 3; i++ {
		netFail, forbidden, err = a.hw.StorageOccupyCell(a.evalCell, string(req.Domain), tx)
		if err != nil {
			err = a.brokenProxy(err)
			return
		}
		if forbidden {
			break
		}
		if netFail {
			<-time.After(time.Second * 5)
			continue
		}
		break
	}

	switch {
	case netFail, forbidden:
		res = EvalStoreResult{
			Failure: &EvalStoreResultFailure{
				NetworkUnavailable: netFail,
				Forbidden:          forbidden,
			},
		}
		return
	default:
	}

	cell, err := a.hw.StoreAfterHydroEval()
	if err != nil {
		_ = a.brokenProxy(err)
	}

	a.evalState = evalInitial
	res = EvalStoreResult{
		Success: &EvalStoreResultSuccess{
			Cell:        cell,
			Transaction: tx,
		},
	}
	return
}

////// STORAGE //////

// Requires hardware to extract an item from the specified storage cell and bring it to the outlet window.
// On successful extraction the outlet window should be closed manually: customer choice (preferred) or a timeout.
func (a *Impl) StorageExtract(req StorageExtractRequest) (res StorageExtractResult, err error) {
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

	// occupy on backend side (with multiple attempts)
	var (
		netFail   bool
		forbidden bool
	)
	for i := 0; i < 3; i++ {
		netFail, forbidden, err = a.hw.StorageReleaseCell(req.Cell, string(req.Domain), tx)
		if err != nil {
			err = a.brokenProxy(err)
			return
		}
		if forbidden {
			break
		}
		if netFail {
			<-time.After(time.Second * 5)
			continue
		}
		break
	}

	switch {
	case netFail, forbidden:
		res = StorageExtractResult{
			Failure: &StorageExtractResultFailure{
				NetworkUnavailable: netFail,
				Forbidden:          forbidden,
			},
		}
		return
	default:
	}

	if err = a.hw.ExtractCellFromStorage(req.Cell); err != nil {
		_ = a.brokenProxy(err)
	}

	a.evalState = evalOutletOpened
	res = StorageExtractResult{
		Success: &StorageExtractResultSuccess{
			Transaction: tx,
		},
	}
	return
}

////// OTHER //////

// Checks the internet connection and custom hardware modules are available.
func (a *Impl) Status() (res StatusResult, err error) {
	sh, err := a.hw.OptionalHardwareHealth()
	if err != nil {
		return
	}
	res = StatusResult{
		Operational:        a.mod.Operational(),
		InternetConnection: a.hw.InternetConnectivity(),
		OptionalHardware:   sh,
		Features: StatusResultFeatures{
			Storage:           a.hw.HasStorage(),
			PositionalStorage: a.hw.HasPositionalStorage(),
		},
	}
	return
}

// Performs a call to a named backend method defined in Goldex dashboard.
func (a *Impl) Goldex(req GoldexRequest) (res GoldexResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	httpStatus, response, err := a.hw.IntegrationUIMethod(req.Method, req.Body)
	if err != nil {
		return
	}
	res = GoldexResult{
		HttpStatus: httpStatus,
		Body:       response,
	}
	return
}

// Call an RPC method of the optional hardware installed within the terminal.
func (a *Impl) Hardware(req HardwareRequest) (res HardwareResult, err error) {
	if err = newValidator().Struct(req); err != nil {
		return
	}
	kv, err := a.hw.OptionalHardwareMethod(req.Name, req.Method, req.Params)
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
