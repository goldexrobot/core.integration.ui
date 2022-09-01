// Package api provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/deepmap/oapi-codegen version v1.11.1-0.20220609223533-7da811e1cf30 DO NOT EDIT.
package api

import (
	"encoding/json"
	"errors"
)

// Defines values for EvalHydroResultFailureFailure.
const (
	EvalHydroResultFailureFailureItemRejected       EvalHydroResultFailureFailure = "item_rejected"
	EvalHydroResultFailureFailureNetworkUnavailable EvalHydroResultFailureFailure = "network_unavailable"
	EvalHydroResultFailureFailureUnstableScale      EvalHydroResultFailureFailure = "unstable_scale"
)

// Defines values for EvalNewResultFailureFailure.
const (
	EvalNewResultFailureFailureHardwareCheckFailed EvalNewResultFailureFailure = "hardware_check_failed"
	EvalNewResultFailureFailureNetworkUnavailable  EvalNewResultFailureFailure = "network_unavailable"
	EvalNewResultFailureFailureNoStorageRoom       EvalNewResultFailureFailure = "no_storage_room"
)

// Defines values for EvalSpectrumResultFailureFailure.
const (
	EvalSpectrumResultFailureFailureItemRejected       EvalSpectrumResultFailureFailure = "item_rejected"
	EvalSpectrumResultFailureFailureNetworkUnavailable EvalSpectrumResultFailureFailure = "network_unavailable"
)

// Defines values for EvalStoreRequestDomain.
const (
	EvalStoreRequestDomainBuyout   EvalStoreRequestDomain = "buyout"
	EvalStoreRequestDomainCustom   EvalStoreRequestDomain = "custom"
	EvalStoreRequestDomainPawnshop EvalStoreRequestDomain = "pawnshop"
)

// Defines values for EvalStoreResultFailureFailure.
const (
	EvalStoreResultFailureFailureForbidden          EvalStoreResultFailureFailure = "forbidden"
	EvalStoreResultFailureFailureNetworkUnavailable EvalStoreResultFailureFailure = "network_unavailable"
)

// Defines values for ItemRejectionReason.
const (
	HighWeight  ItemRejectionReason = "high_weight"
	LowSpectrum ItemRejectionReason = "low_spectrum"
	LowWeight   ItemRejectionReason = "low_weight"
	Unconfirmed ItemRejectionReason = "unconfirmed"
	Undescribed ItemRejectionReason = "undescribed"
)

// Defines values for StorageExtractRequestDomain.
const (
	StorageExtractRequestDomainCustom   StorageExtractRequestDomain = "custom"
	StorageExtractRequestDomainPawnshop StorageExtractRequestDomain = "pawnshop"
	StorageExtractRequestDomainShop     StorageExtractRequestDomain = "shop"
)

// Defines values for StorageExtractResultFailureFailure.
const (
	Forbidden          StorageExtractResultFailureFailure = "forbidden"
	NetworkUnavailable StorageExtractResultFailureFailure = "network_unavailable"
)

// EvalHydroResult defines model for EvalHydroResult.
type EvalHydroResult struct {
	union json.RawMessage
}

// EvalHydroResultFailure defines model for EvalHydroResultFailure.
type EvalHydroResultFailure struct {
	Failure EvalHydroResultFailureFailure `json:"failure"`

	// Reason why the item is rejected by the Goldex. It's non-empty if evaluation failure is `item_rejected`
	Reason  ItemRejectionReason `json:"reason"`
	Success string              `json:"success"`
}

// EvalHydroResultFailureFailure defines model for EvalHydroResultFailure.Failure.
type EvalHydroResultFailureFailure string

// EvalHydroResultSuccess defines model for EvalHydroResultSuccess.
type EvalHydroResultSuccess struct {
	// Valuable metal
	Alloy string `json:"alloy"`

	// Fineness in carats
	Carat string `json:"carat"`

	// Evaluation confidence, 1.0 - is confident, 0.0 - is not, 0.8 - is "pretty" confident
	Confidence float64 `json:"confidence"`

	// Millesimal fineness, 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
	Millesimal int64 `json:"millesimal"`

	// Content of the valuable metal in percents
	Purity float64 `json:"purity"`

	// Automatic decision result
	Risky   bool   `json:"risky"`
	Success string `json:"success"`

	// Warnings that should help with decision. For instance, there could be a tungsten covered with gold.
	Warnings []string `json:"warnings"`

	// Weight in grams
	Weight float64 `json:"weight"`
}

// Data depending on success flag
type EvalNewResult struct {
	union json.RawMessage
}

// EvalNewResultFailure defines model for EvalNewResultFailure.
type EvalNewResultFailure struct {
	Failure EvalNewResultFailureFailure `json:"failure"`
	Success string                      `json:"success"`
}

// EvalNewResultFailureFailure defines model for EvalNewResultFailure.Failure.
type EvalNewResultFailureFailure string

// EvalNewResultSuccess defines model for EvalNewResultSuccess.
type EvalNewResultSuccess struct {
	// Evaluation ID
	EvalId uint64 `json:"eval_id"`

	// Storage cell address
	StorageCell StorageCell `json:"storage_cell" validate:"required,alphanum,min=2,max=4"`
	Success     string      `json:"success"`
}

// EvalSpectrumResult defines model for EvalSpectrumResult.
type EvalSpectrumResult struct {
	union json.RawMessage
}

// EvalSpectrumResultFailure defines model for EvalSpectrumResultFailure.
type EvalSpectrumResultFailure struct {
	Failure EvalSpectrumResultFailureFailure `json:"failure"`

	// Reason why the item is rejected by the Goldex. It's non-empty if evaluation failure is `item_rejected`
	Reason  ItemRejectionReason `json:"reason"`
	Success string              `json:"success"`
}

// EvalSpectrumResultFailureFailure defines model for EvalSpectrumResultFailure.Failure.
type EvalSpectrumResultFailureFailure string

// EvalSpectrumResultSuccess defines model for EvalSpectrumResultSuccess.
type EvalSpectrumResultSuccess struct {
	// Valuable metal
	Alloy string `json:"alloy"`

	// Fineness in carats
	Carat string `json:"carat"`

	// Millesimal fineness. 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
	Millesimal int64 `json:"millesimal"`

	// Content of the valuable metal in percents
	Purity float64 `json:"purity"`

	// Spectrum data
	Spectrum map[string]float64 `json:"spectrum"`
	Success  string             `json:"success"`
}

// EvalStoreRequest defines model for EvalStoreRequest.
type EvalStoreRequest struct {
	// Cell occupation operation domain
	Domain EvalStoreRequestDomain `json:"domain" validate:"required,oneof=buyout pawnshop custom"`
}

// Cell occupation operation domain
type EvalStoreRequestDomain string

// EvalStoreResult defines model for EvalStoreResult.
type EvalStoreResult struct {
	union json.RawMessage
}

// EvalStoreResultFailure defines model for EvalStoreResultFailure.
type EvalStoreResultFailure struct {
	Failure EvalStoreResultFailureFailure `json:"failure"`
	Success string                        `json:"success"`
}

// EvalStoreResultFailureFailure defines model for EvalStoreResultFailure.Failure.
type EvalStoreResultFailureFailure string

// EvalStoreResultSuccess defines model for EvalStoreResultSuccess.
type EvalStoreResultSuccess struct {
	// Storage cell address
	Cell    StorageCell `json:"cell" validate:"required,alphanum,min=2,max=4"`
	Success string      `json:"success"`

	// Unique storage cell operation ID
	Transaction StorageCellTransaction `json:"transaction"`
}

// HardwareEvent defines model for HardwareEvent.
type HardwareEvent struct {
	// Event data
	Data map[string]interface{} `json:"data"`

	// Event name
	Event string `json:"event"`

	// Named hardware
	Name string `json:"name"`
}

// HardwareRequest defines model for HardwareRequest.
type HardwareRequest struct {
	// Method name
	Method string `json:"method" validate:"required"`

	// Named hardware
	Name string `json:"name" validate:"required"`

	// Method params
	Params json.RawMessage `json:"params"`
}

// HardwareResult defines model for HardwareResult.
type HardwareResult struct {
	// Hardware method result
	Result json.RawMessage `json:"result"`
}

// Reason why the item is rejected by the Goldex. It's non-empty if evaluation failure is `item_rejected`
type ItemRejectionReason string

// ProxyRequest defines model for ProxyRequest.
type ProxyRequest struct {
	// Request key-value
	Body map[string]interface{} `json:"body"`

	// Predefined endpoint name
	Endpoint string `json:"endpoint" validate:"required"`
}

// ProxyResult defines model for ProxyResult.
type ProxyResult struct {
	// Result key-value
	Body map[string]interface{} `json:"body"`

	// http status
	HttpStatus int64 `json:"http_status"`
}

// StatusResult defines model for StatusResult.
type StatusResult struct {
	BotId    uint64               `json:"bot_id"`
	Features StatusResultFeatures `json:"features"`

	// Internet connectivity
	InternetConnection bool `json:"internet_connection"`

	// Operational status. False if robot is broken or some mandatory hardware is unavailable
	Operational bool `json:"operational"`

	// available optional hardware
	OptionalHardware map[string]bool `json:"optional_hardware"`
	ProjectId        uint64          `json:"project_id"`
}

// StatusResultFeatures defines model for StatusResultFeatures.
type StatusResultFeatures struct {
	// Items storage is a positional storage (has cells to store items)
	PositionalStorage bool `json:"positional_storage"`

	// Items storage is available
	Storage bool `json:"storage"`
}

// Storage cell address
type StorageCell = string

// Unique storage cell operation ID
type StorageCellTransaction = string

// StorageExtractRequest defines model for StorageExtractRequest.
type StorageExtractRequest struct {
	// Storage cell address
	Cell StorageCell `json:"cell" validate:"required,alphanum,min=2,max=4"`

	// Cell release operation domain
	Domain StorageExtractRequestDomain `json:"domain" validate:"required,oneof=shop pawnshop custom"`
}

// Cell release operation domain
type StorageExtractRequestDomain string

// StorageExtractResult defines model for StorageExtractResult.
type StorageExtractResult struct {
	union json.RawMessage
}

// StorageExtractResultFailure defines model for StorageExtractResultFailure.
type StorageExtractResultFailure struct {
	Failure StorageExtractResultFailureFailure `json:"failure"`
	Success string                             `json:"success"`
}

// StorageExtractResultFailureFailure defines model for StorageExtractResultFailure.Failure.
type StorageExtractResultFailureFailure string

// StorageExtractResultSuccess defines model for StorageExtractResultSuccess.
type StorageExtractResultSuccess struct {
	Success string `json:"success"`

	// Unique storage cell operation ID
	Transaction StorageCellTransaction `json:"transaction"`
}

// EmptyResult defines model for EmptyResult.
type EmptyResult = map[string]interface{}

// Error defines model for Error.
type Error struct {
	// Standard or implementation-dependent error code
	Code float32 `json:"code"`

	// Error description
	Message string `json:"message"`
}

// EmptyParams defines model for EmptyParams.
type EmptyParams = map[string]interface{}

// EvalStoreJSONBody defines parameters for EvalStore.
type EvalStoreJSONBody = EvalStoreRequest

// HardwareEventJSONBody defines parameters for HardwareEvent.
type HardwareEventJSONBody = HardwareEvent

// HardwareJSONBody defines parameters for Hardware.
type HardwareJSONBody = HardwareRequest

// ProxyJSONBody defines parameters for Proxy.
type ProxyJSONBody = ProxyRequest

// StorageExtractJSONBody defines parameters for StorageExtract.
type StorageExtractJSONBody = StorageExtractRequest

// EvalHydroJSONRequestBody defines body for EvalHydro for application/json ContentType.
type EvalHydroJSONRequestBody = EmptyParams

// EvalNewJSONRequestBody defines body for EvalNew for application/json ContentType.
type EvalNewJSONRequestBody = EmptyParams

// EvalReturnJSONRequestBody defines body for EvalReturn for application/json ContentType.
type EvalReturnJSONRequestBody = EmptyParams

// EvalSpectrumJSONRequestBody defines body for EvalSpectrum for application/json ContentType.
type EvalSpectrumJSONRequestBody = EmptyParams

// EvalStoreJSONRequestBody defines body for EvalStore for application/json ContentType.
type EvalStoreJSONRequestBody = EvalStoreJSONBody

// HardwareEventJSONRequestBody defines body for HardwareEvent for application/json ContentType.
type HardwareEventJSONRequestBody = HardwareEventJSONBody

// HardwareJSONRequestBody defines body for Hardware for application/json ContentType.
type HardwareJSONRequestBody = HardwareJSONBody

// InletCloseJSONRequestBody defines body for InletClose for application/json ContentType.
type InletCloseJSONRequestBody = EmptyParams

// InletOpenJSONRequestBody defines body for InletOpen for application/json ContentType.
type InletOpenJSONRequestBody = EmptyParams

// OutletCloseJSONRequestBody defines body for OutletClose for application/json ContentType.
type OutletCloseJSONRequestBody = EmptyParams

// ProxyJSONRequestBody defines body for Proxy for application/json ContentType.
type ProxyJSONRequestBody = ProxyJSONBody

// StatusJSONRequestBody defines body for Status for application/json ContentType.
type StatusJSONRequestBody = EmptyParams

// StorageExtractJSONRequestBody defines body for StorageExtract for application/json ContentType.
type StorageExtractJSONRequestBody = StorageExtractJSONBody

func (t EvalHydroResult) AsEvalHydroResultSuccess() (EvalHydroResultSuccess, error) {
	var body EvalHydroResultSuccess
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalHydroResult) FromEvalHydroResultSuccess(v EvalHydroResultSuccess) error {
	v.Success = "true"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalHydroResult) AsEvalHydroResultFailure() (EvalHydroResultFailure, error) {
	var body EvalHydroResultFailure
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalHydroResult) FromEvalHydroResultFailure(v EvalHydroResultFailure) error {
	v.Success = "false"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalHydroResult) Discriminator() (string, error) {
	var discriminator struct {
		Discriminator string `json:"success"`
	}
	err := json.Unmarshal(t.union, &discriminator)
	return discriminator.Discriminator, err
}

func (t EvalHydroResult) ValueByDiscriminator() (interface{}, error) {
	discriminator, err := t.Discriminator()
	if err != nil {
		return nil, err
	}
	switch discriminator {
	case "false":
		return t.AsEvalHydroResultFailure()
	case "true":
		return t.AsEvalHydroResultSuccess()
	default:
		return nil, errors.New("unknown discriminator value: " + discriminator)
	}
}

func (t EvalHydroResult) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *EvalHydroResult) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}

func (t EvalNewResult) AsEvalNewResultSuccess() (EvalNewResultSuccess, error) {
	var body EvalNewResultSuccess
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalNewResult) FromEvalNewResultSuccess(v EvalNewResultSuccess) error {
	v.Success = "true"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalNewResult) AsEvalNewResultFailure() (EvalNewResultFailure, error) {
	var body EvalNewResultFailure
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalNewResult) FromEvalNewResultFailure(v EvalNewResultFailure) error {
	v.Success = "false"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalNewResult) Discriminator() (string, error) {
	var discriminator struct {
		Discriminator string `json:"success"`
	}
	err := json.Unmarshal(t.union, &discriminator)
	return discriminator.Discriminator, err
}

func (t EvalNewResult) ValueByDiscriminator() (interface{}, error) {
	discriminator, err := t.Discriminator()
	if err != nil {
		return nil, err
	}
	switch discriminator {
	case "false":
		return t.AsEvalNewResultFailure()
	case "true":
		return t.AsEvalNewResultSuccess()
	default:
		return nil, errors.New("unknown discriminator value: " + discriminator)
	}
}

func (t EvalNewResult) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *EvalNewResult) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}

func (t EvalSpectrumResult) AsEvalSpectrumResultSuccess() (EvalSpectrumResultSuccess, error) {
	var body EvalSpectrumResultSuccess
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalSpectrumResult) FromEvalSpectrumResultSuccess(v EvalSpectrumResultSuccess) error {
	v.Success = "true"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalSpectrumResult) AsEvalSpectrumResultFailure() (EvalSpectrumResultFailure, error) {
	var body EvalSpectrumResultFailure
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalSpectrumResult) FromEvalSpectrumResultFailure(v EvalSpectrumResultFailure) error {
	v.Success = "false"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalSpectrumResult) Discriminator() (string, error) {
	var discriminator struct {
		Discriminator string `json:"success"`
	}
	err := json.Unmarshal(t.union, &discriminator)
	return discriminator.Discriminator, err
}

func (t EvalSpectrumResult) ValueByDiscriminator() (interface{}, error) {
	discriminator, err := t.Discriminator()
	if err != nil {
		return nil, err
	}
	switch discriminator {
	case "false":
		return t.AsEvalSpectrumResultFailure()
	case "true":
		return t.AsEvalSpectrumResultSuccess()
	default:
		return nil, errors.New("unknown discriminator value: " + discriminator)
	}
}

func (t EvalSpectrumResult) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *EvalSpectrumResult) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}

func (t EvalStoreResult) AsEvalStoreResultSuccess() (EvalStoreResultSuccess, error) {
	var body EvalStoreResultSuccess
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalStoreResult) FromEvalStoreResultSuccess(v EvalStoreResultSuccess) error {
	v.Success = "true"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalStoreResult) AsEvalStoreResultFailure() (EvalStoreResultFailure, error) {
	var body EvalStoreResultFailure
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *EvalStoreResult) FromEvalStoreResultFailure(v EvalStoreResultFailure) error {
	v.Success = "false"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t EvalStoreResult) Discriminator() (string, error) {
	var discriminator struct {
		Discriminator string `json:"success"`
	}
	err := json.Unmarshal(t.union, &discriminator)
	return discriminator.Discriminator, err
}

func (t EvalStoreResult) ValueByDiscriminator() (interface{}, error) {
	discriminator, err := t.Discriminator()
	if err != nil {
		return nil, err
	}
	switch discriminator {
	case "false":
		return t.AsEvalStoreResultFailure()
	case "true":
		return t.AsEvalStoreResultSuccess()
	default:
		return nil, errors.New("unknown discriminator value: " + discriminator)
	}
}

func (t EvalStoreResult) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *EvalStoreResult) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}

func (t StorageExtractResult) AsStorageExtractResultSuccess() (StorageExtractResultSuccess, error) {
	var body StorageExtractResultSuccess
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *StorageExtractResult) FromStorageExtractResultSuccess(v StorageExtractResultSuccess) error {
	v.Success = "true"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t StorageExtractResult) AsStorageExtractResultFailure() (StorageExtractResultFailure, error) {
	var body StorageExtractResultFailure
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t *StorageExtractResult) FromStorageExtractResultFailure(v StorageExtractResultFailure) error {
	v.Success = "false"
	b, err := json.Marshal(v)
	t.union = b
	return err
}

func (t StorageExtractResult) Discriminator() (string, error) {
	var discriminator struct {
		Discriminator string `json:"success"`
	}
	err := json.Unmarshal(t.union, &discriminator)
	return discriminator.Discriminator, err
}

func (t StorageExtractResult) ValueByDiscriminator() (interface{}, error) {
	discriminator, err := t.Discriminator()
	if err != nil {
		return nil, err
	}
	switch discriminator {
	case "false":
		return t.AsStorageExtractResultFailure()
	case "true":
		return t.AsStorageExtractResultSuccess()
	default:
		return nil, errors.New("unknown discriminator value: " + discriminator)
	}
}

func (t StorageExtractResult) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *StorageExtractResult) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}
