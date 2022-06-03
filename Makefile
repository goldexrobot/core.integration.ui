all: swagger oapi-codegen-apiv1
	@:

tools:
	go install github.com/deepmap/oapi-codegen/cmd/oapi-codegen@latest
	
swagger:
	cp ./api/v1/openapi.yaml ./docs/api-v1.yaml

oapi-codegen-apiv1:
	cd ./pkg/v1 && \
		oapi-codegen --config ./gen-models.yaml ./../../api/v1/openapi.yaml
