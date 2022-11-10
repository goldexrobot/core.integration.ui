package api

import "context"

type API interface {
	InletOpen(ctx context.Context) (err error)
	InletClose(ctx context.Context) (res InletCloseResult, err error)
	OutletClose(ctx context.Context) (res OutletCloseResult, err error)
	EvalNew(ctx context.Context) (res EvalNewResult, err error)
	EvalSpectrum(ctx context.Context) (res EvalSpectrumResult, err error)
	EvalHydro(ctx context.Context) (res EvalHydroResult, err error)
	EvalReturn(ctx context.Context) (err error)
	EvalStore(ctx context.Context, req EvalStoreRequest) (res EvalStoreResult, err error)
	StorageExtract(ctx context.Context, req StorageExtractRequest) (res StorageExtractResult, err error)
	Status(ctx context.Context) (res StatusResult, err error)
	Proxy(ctx context.Context, req ProxyRequest) (res ProxyResult, err error)
	Hardware(ctx context.Context, req HardwareRequest) (res HardwareResult, err error)
}
