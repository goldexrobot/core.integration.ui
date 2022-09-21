all: swagger oapi-codegen-apiv1
	@:

tools:
	go install github.com/deepmap/oapi-codegen/cmd/oapi-codegen@4a1477f6a8ba6ca8115cc23bb2fb67f0b9fca18e
	
swagger:
	cp ./api/v1/openapi.yaml ./docs/api-v1.yaml

oapi-codegen-apiv1:
	cd ./pkg/v1 && \
		oapi-codegen --config ./gen-models.yaml ./../../api/v1/openapi.yaml
