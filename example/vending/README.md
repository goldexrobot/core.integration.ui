# Example

Customer UI for the Goldex Robot machine using React.

Get Node and run:

```shell
npm i
```

Build using:

```shell
npm run build
```

## dev

Check `dev.env` file and set Websocket URL (mock HTTP server could be specified, see below).

Start dev mode:

```shell
npm start
```

To generate API client code from the OpenAPI schema run:

```shell
npm run gen
```

### mock

You can run mock HTTP API (open-api-mocker):

```shell
npm run mock
```

Don't forget to change `dev.env` and point Websocket to the mock server (`http://localhost:5000`).
