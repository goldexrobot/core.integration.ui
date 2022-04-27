// Terminal JSONRPC API.
//
// Goldex Robot terminal exposes [JSONRPC 2](https://www.jsonrpc.org/specification) API over [Websocket](https://en.wikipedia.org/wiki/WebSocket) connection on localhost\:80\/ws. Websocket messages are textual, not binary.
// The API exposes __methods__ to call by a client, defined as `POST` in this doc ([request](https://www.jsonrpc.org/specification#request_object) in terms of JSONRPC).
// The API sends __events__, defined as `GET` in this doc ([notification](https://www.jsonrpc.org/specification#notification) in terms of JSONRPC).
//
// Actual method/event name is defined in this document after slash `/` symbol. For example\:
//
// `"POST /inlet.open"`
//
// means JSONRPC request to the method `inlet.open`:
//
// `{"jsonrpc":"2.0","id":1,"method":"inlet.open","params":{...}}`
//
// Default flow for an item evaluation (for buyout/pawnshop flow):
// 1. Check `status` to ensure the terminal is online and required optional hardware is available.
// 2. Begin a new evaluation with `eval.new`.
// 3. Open the inlet window `inlet.open` and notify the customer.
// 4. Accept an item and close the inlet window with `inlet.close`.
// 5. Begin a spectral evaluation with `eval.spectrum`. In case of rejection of the item or an explicit cancellation by the customer perform `eval.return` and then `outlet.close`.
// 6. Begin a hydrostatic evaluation with `eval.hydro`. In case of rejection of the item or an explicit cancellation by the customer perform `eval.return` and then `outlet.close`.
// 7. Perform the customer identification, payment processing and whatever is needed by your business flow. In case of critical failure or an explicit cancellation by the customer perform `eval.return` and then `outlet.close`.
// 8. Move the evaluated and accepted item to the storage with `eval.store`.
//
//     Schemes: ws
//     Host: localhost:80
//     BasePath: /ws
//     Version: 1.0.0
//
//     Consumes:
//     - application/json
//
//     Produces:
//     - application/json
//
// swagger:meta
package api

// JSONRPC API
//
type API interface {

	////// INLET/OUTLET WINDOW /////

	// swagger:operation POST /inlet.open InletOpen
	//
	// Open inlet window.
	//
	// Requires hardware to open inlet window. Should be called to receive a customer item before evaluation.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Inlet/outlet window
	// responses:
	//   x-jsonrpc-success:
	//     description: No payload
	//   default:
	//     description: JSONRPC error
	InletOpen() (err error)

	// swagger:operation POST /inlet.close InletClose
	//
	// Close inlet window.
	//
	// Requires hardware to close inlet window. Should be called right before evaluation launch.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Inlet/outlet window
	// responses:
	//   x-jsonrpc-success:
	//     description: No payload
	//   default:
	//     description: JSONRPC error
	InletClose() (err error)

	// swagger:operation POST /outlet.close OutletClose
	//
	// Close outlet window.
	//
	// Requires hardware to close outlet window. Should be called manually after customer item return or storage item extraction.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Inlet/outlet window
	// responses:
	//   x-jsonrpc-success:
	//     description: No payload
	//   default:
	//     description: JSONRPC error
	OutletClose() (err error)

	///// EVALUATION //////

	// swagger:operation POST /eval.new EvalNew
	//
	// New evaluation [I].
	//
	// Prepares a new evaluation operation: check hardware, notify backend server, etc.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Evaluation
	// responses:
	//   x-jsonrpc-success:
	//     description: Result (one of)
	//     schema:
	//       $ref: "#/definitions/EvalNewResult"
	//   default:
	//     description: JSONRPC error
	EvalNew() (res EvalNewResult, err error)

	// swagger:operation POST /eval.spectrum EvalSpectrum
	//
	// Spectral evaluation [II].
	//
	// Starts a spectral evaluation of the item. Should be called right after `eval.new`.
	// On successful spectral evaluation the item might be returned back to customer with `eval.return`, otherwise the evaluation should be continued with `eval.hydro`.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Evaluation
	// responses:
	//   x-jsonrpc-success:
	//     description: Result (one of)
	//     schema:
	//       $ref: "#/definitions/EvalSpectrumResult"
	//   default:
	//     description: JSONRPC error
	EvalSpectrum() (res EvalSpectrumResult, err error)

	// swagger:operation POST /eval.hydro EvalHydro
	//
	// Hydrostatic evaluation [III].
	//
	// Starts a hydrostatic evaluation of the item. Should be called right after `eval.spectrum`.
	// On successful hydrostatic evaluation the item might be returned back to customer with `eval.return`.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Evaluation
	// responses:
	//   x-jsonrpc-success:
	//     description: Hydrostatic evaluation result
	//     schema:
	//       $ref: "#/definitions/EvalHydroResult"
	//   default:
	//     description: JSONRPC error
	EvalHydro() (res EvalHydroResult, err error)

	// swagger:operation POST /eval.return EvalReturn
	//
	// Return item [IV].
	//
	// Starts a returning process of the item. Should be called after spectral/hydrostatic evaluation.
	// On successful returning outlet window should be closed manually: customer choice (preferred) or a timeout.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Evaluation
	// responses:
	//   x-jsonrpc-success:
	//     description: No payload
	//   default:
	//     description: JSONRPC error
	EvalReturn() (err error)

	// swagger:operation POST /eval.store EvalStore
	//
	// Store item [IV].
	//
	// Requires hardware to transfer successfully evaluated item into the internal storage.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Evaluation
	// parameters:
	//   - in: body
	//     description: JSONRPC params
	//     schema:
	//       $ref: "#/definitions/EvalStoreRequest"
	// responses:
	//   x-jsonrpc-success:
	//     description: Result (one of)
	//     schema:
	//       $ref: "#/definitions/EvalStoreResult"
	//   default:
	//     description: JSONRPC error
	EvalStore(req EvalStoreRequest) (res EvalStoreResult, err error)

	////// STORAGE //////

	// swagger:operation POST /storage.extract StorageExtract
	//
	// Extract item.
	//
	// Requires hardware to extract an item from the specified storage cell and bring it to the outlet window.
	// On successful extraction the outlet window should be closed manually: customer choice (preferred) or a timeout.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Storage
	// parameters:
	//   - in: body
	//     description: JSONRPC params
	//     schema:
	//       $ref: "#/definitions/StorageExtractRequest"
	// responses:
	//   x-jsonrpc-success:
	//     description: Result (one of)
	//     schema:
	//       "$ref": "#/definitions/StorageExtractResult"
	//   default:
	//     description: JSONRPC error
	StorageExtract(req StorageExtractRequest) (res StorageExtractResult, err error)

	////// OTHER //////

	// swagger:operation POST /status Status
	//
	// Current status.
	//
	// Reports current status: operational status, internet connectivity, optional hardware health.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Other
	// responses:
	//   x-jsonrpc-success:
	//     description: Result
	//     schema:
	//       "$ref": "#/definitions/StatusResult"
	//   default:
	//     description: JSONRPC error
	Status() (res StatusResult, err error)

	// swagger:operation POST /goldex Goldex
	//
	// Call to a named Goldex backend method.
	//
	// Performs a call to a named backend method defined in Goldex dashboard.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Other
	// parameters:
	//   - in: body
	//     description: JSONRPC params
	//     schema:
	//       $ref: "#/definitions/GoldexRequest"
	// responses:
	//   x-jsonrpc-success:
	//     description: Result
	//     schema:
	//       $ref: "#/definitions/GoldexResult"
	//   default:
	//     description: JSONRPC error
	Goldex(req GoldexRequest) (res GoldexResult, err error)

	// swagger:operation POST /hardware Hardware
	//
	// Call to optional hardware.
	//
	// Call an RPC method of the optional hardware installed within the terminal.
	// ---
	// consumes:
	// - application/json
	// produces:
	// - application/json
	// tags:
	//   - Other
	// parameters:
	//   - in: body
	//     description: JSONRPC params
	//     schema:
	//       $ref: "#/definitions/HardwareRequest"
	// responses:
	//   x-jsonrpc-success:
	//     description: Result
	//     schema:
	//       $ref: "#/definitions/HardwareResult"
	//   default:
	//     description: JSONRPC error
	Hardware(req HardwareRequest) (res HardwareResult, err error)

	////// EVENTS //////

	// swagger:operation GET /hardware EventHardware
	//
	// Event from optional hardware.
	//
	// An event may be generated by optional hardware installed within the terminal. Depends on implementation.
	//
	// ---
	// parameters:
	//   - in: body
	//     description: JSONRPC params
	//     schema:
	//       $ref: "#/definitions/HardwareEvent"
	// tags:
	//   - Events
}

// swagger:model
type EvalNewResult struct {
	Success *EvalNewResultSuccess `json:"success,omitempty"`
	Failure *EvalNewResultFailure `json:"failure,omitempty"`
}

// swagger:model
type EvalNewResultSuccess struct {
	// evaluation ID
	//
	// example: 42
	EvalID uint64 `json:"eval_id"`

	// allocated storage cell address
	//
	// example: A1
	StorageCell string `json:"storage_cell"`
}

// swagger:model
type EvalNewResultFailure struct {
	// one of: network failure (retryable)
	NetworkUnavailable bool `json:"network_unavailable,omitempty"`

	// one of: primary hardware healthcheck failed (retryable)
	HardwareCheck bool `json:"hardware_check,omitempty"`

	// one of: no more room in the storage (retryable)
	NoStorageRoom bool `json:"no_storage_room,omitempty"`
}

// swagger:model
type EvalSpectrumResult struct {
	Success *EvalSpectrumResultSuccess `json:"success,omitempty"`
	Failure *EvalSpectrumResultFailure `json:"failure,omitempty"`
}

// swagger:model
type EvalSpectrumResultSuccess struct {
	// valuable metal
	//
	// example: au
	Alloy string `json:"alloy"`

	// content of the valuable metal in percents
	//
	// example: 58.5
	Purity float64 `json:"purity"`

	// millesimal fineness, 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
	//
	// example: 585
	Millesimal int `json:"millesimal"`

	// fineness in carats
	//
	// example: 14K
	Carat string `json:"carat"`

	// spectrum data
	//
	// example: {"au":58.5,"cu":14.2}
	Spectrum map[string]float64 `json:"spectrum"`
}

// swagger:model
type EvalSpectrumResultFailure struct {
	// one of: network failure (fatal)
	NetworkUnavailable bool `json:"network_unavailable,omitempty"`
	// one of: no valuable metal found, evaluation is rejected by the backend and should be returned back to customer (fatal)
	EvalRejected bool `json:"eval_rejected,omitempty"`

	// predefined reason, non-empty if `eval_rejected` is true
	RejectionReason string `json:"rejection_reason,omitempty"`
}

// swagger:model
type EvalHydroResult struct {
	Success *EvalHydroResultSuccess `json:"success,omitempty"`
	Failure *EvalHydroResultFailure `json:"failure,omitempty"`
}

// swagger:model
type EvalHydroResultSuccess struct {
	// valuable metal
	//
	// example: au
	Alloy string `json:"alloy"`

	// content of the valuable metal in percents
	//
	// example: 58.5
	Purity float64 `json:"purity"`

	// millesimal fineness, 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
	//
	// example: 585
	Millesimal int `json:"millesimal"`

	// fineness in carats
	//
	// example: 14K
	Carat string `json:"carat"`

	// weight in grams
	//
	// example: 3.141
	Weight float64 `json:"weight"`

	// evaluation confidence, 1.0 - is confident, 0.0 - is not, 0.8 - is "pretty" confident
	//
	// example: 0.913
	Confidence float64 `json:"confidence"`

	// automatic decision result
	Risky bool `json:"risky"`

	// warnings that should help with decision. For instance, there could be tungsten covered with gold.
	//
	// example: ["tungsten_in_gold"]
	Warnings []string `json:"warnings"`
}

// swagger:model
type EvalHydroResultFailure struct {
	// one of: network failure (fatal)
	NetworkUnavailable bool `json:"network_unavailable,omitempty"`
	// one of: no valuable metal found, evaluation is rejected by the backend and should be returned back to customer (fatal)
	EvalRejected bool `json:"eval_rejected,omitempty"`
	// one of: weighing scale is affected by a mechanical vibration (fatal)
	UnstableScale bool `json:"unstable_scale,omitempty"`

	// predefined reason, non-empty if `eval_rejected` is true
	RejectionReason string `json:"rejection_reason,omitempty"`
}

// swagger:model
type EvalStoreRequest struct {
	// occupation domain: `buyout`, `pawnshop` or `other`
	//
	// example: buyout
	Domain string `json:"domain" validate:"oneof=buyout pawnshop other"`
}

// swagger:model
type EvalStoreResult struct {
	Success *EvalStoreResultSuccess `json:"success,omitempty"`
	Failure *EvalStoreResultFailure `json:"failure,omitempty"`
}

// swagger:model
type EvalStoreResultSuccess struct {
	// cell address
	//
	// example: A1
	Cell string `json:"cell"`

	// storing identity
	//
	// example: 6c8ec8b3e88b4fcaac47f781f5e6343e
	Transaction string `json:"transaction"`
}

// swagger:model
type EvalStoreResultFailure struct {
	// one of: network failure (retryable)
	NetworkUnavailable bool `json:"network_unavailable,omitempty"`

	// one of: storing is forbidden
	Forbidden bool `json:"forbidden,omitempty"`
}

// swagger:model
type StorageExtractRequest struct {
	// cell address
	//
	// example: A1
	Cell string `json:"cell" validate:"required,uppercase,min=2,max=4"`

	// occupation domain: `pawnshop`, `shop` or `other`
	//
	// example: shop
	Domain string `json:"domain" validate:"oneof=pawnshop shop other"`
}

// swagger:model
type StorageExtractResult struct {
	Success *StorageExtractResultSuccess `json:"success,omitempty"`
	Failure *StorageExtractResultFailure `json:"failure,omitempty"`
}

// swagger:model
type StorageExtractResultSuccess struct {
	// extraction identity
	//
	// example: 6c8ec8b3e88b4fcaac47f781f5e6343e
	Transaction string `json:"transaction"`
}

// swagger:model
type StorageExtractResultFailure struct {
	// one of: network failure (retryable)
	NetworkUnavailable bool `json:"network_unavailable,omitempty"`

	// one of: extraction is forbidden
	Forbidden bool `json:"forbidden,omitempty"`
}

// swagger:model
type StatusResult struct {
	// operational status
	//
	// example: true
	Operational bool `json:"operational"`

	// internet connectivity
	//
	// example: true
	InternetConnection bool `json:"internet_connection"`

	// available features
	//
	Features StatusResultFeatures `json:"features"`

	// available optional hardware
	//
	// example: {"my-pos":true,"my-printer":true}
	OptionalHardware map[string]bool `json:"optional_hardware"`
}

// swagger:model
type StatusResultFeatures struct {
	// items storage is available
	//
	// example: true
	Storage bool `json:"storage"`

	// items storage is positional storage (has cells to store/extract items)
	//
	// example: true
	PositionalStorage bool `json:"positional_storage"`
}

// swagger:model
type GoldexRequest struct {
	// predefined method name
	//
	// example: my-method
	Method string `json:"method" validate:"required,max=128"`

	// request key-value
	//
	// example: {"foo":"bar","bar":["baz","qux"]}
	Body map[string]interface{} `json:"body"`
}

// swagger:model
type GoldexResult struct {
	// http status
	//
	// example: 200
	HttpStatus int `json:"http_status"`

	// result key-value
	//
	// example: {"foo":"bar","bar":["baz","qux"]}
	Body map[string]interface{} `json:"body"`
}

// swagger:model
type HardwareRequest struct {
	// named hardware
	//
	// example: my-pos
	Name string `json:"name" validate:"required"`

	// method name
	//
	// example: my-method
	Method string `json:"method" validate:"required"`

	// method params
	//
	// example: {"foo":"bar","bar":["baz","qux"]}
	Params interface{} `json:"params"`
}

// swagger:model
type HardwareResult struct {
	// result data
	//
	// example: {"foo":"bar","bar":["baz","qux"]}
	Result interface{} `json:"result"`
}

// swagger:model
type OptionalHardwareEvent struct {
	// named hardware
	//
	// example: my-pos
	Name string `json:"name"`

	// event name
	//
	// example: my-event
	Event string `json:"event"`

	// event data key-value
	//
	// example: {"foo":"bar","bar":["baz","qux"]}
	Data interface{} `json:"data"`
}
