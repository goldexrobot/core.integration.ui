all: swagger-api
	@:

swagger-api:
	@MSYS_NO_PATHCONV=1 docker run --rm -v $(shell pwd):/goldex:rw -it quay.io/goswagger/swagger generate spec -m -w /goldex/api/v1 -o /goldex/swagger/v1/api.swagger.json 
