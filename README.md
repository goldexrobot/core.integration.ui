# Goldex Robot: Integration

Integration with Goldex consists of two major parts: backend integration and UI (terminal) integration.

This document covers UI integration.

[See backend integration](https://github.com/goldexrobot/core.integration.backend).

## TL;DR

Goldex terminal serves HTML UI (zipped SPA where everything needed is included).

UI communicates with local JSONRPC API to control the terminal hardware. Other end of the UI calls to the business backend.

There are some limitations, unlike the usual website development (details below).

Standard UI flow is described at the end of the page.

[Swagger](https://goldexrobot.github.io/core.integration.ui/) describes local API.

---

## UI

Goldex terminal displays customer UI on the screen. UI is an HTML SPA (single page application) and served locally on the terminal.

The terminal exposes an API that allows a developer to access the terminal hardware, interact with a business backend, etc.

UI files must contain `index.html` and `ui-config.yaml`. Index is an entry point for the UI. Config file contains a settings for the UI (see below).

WebKit engine is used to serve HTML. There are some limitations:

- The terminal have a touchscreen, so please keep in mind double-taps and mis-taps. See details below;
- Utilize all the required resources locally, i.e. JS, CSS, icons, etc., except videos;
- Do not embed huge resources like video into the UI package, use resources downloading instead (see below);
- Do not use transparent video;
- Database is unavailable, use local storage instead;
- PDF rendering is not supported;
- WebGL might be available;
- Java is not available;

---

## API

API is served locally on the terminal. It exposes **methods** to control the terminal from UI and sends **events** to notify UI (for instance, optional hardware could send events).

API is a [JSONRPC 2](https://www.jsonrpc.org/specification) API over [Websocket](https://en.wikipedia.org/wiki/WebSocket) connection (`http://localhost:80/ws`).

[JSONRPC 2 batch](https://www.jsonrpc.org/specification#batch) requests are not supported. Moreover, hardware-related methods should be called sequently, error will be returned otherwise.

---

## More

### Resources downloading

Goldex terminal handles `GET /cached` method locally (i.e. on localhost, where UI is served) to download and cache any required runtime resources like images, videos etc.

Because of there is no a browser cache, it's recommended to use the method to get frequently used huge data once at the startup and then request it later with zero-time delivery.

Syntax: `GET /cached?url={url}&auth={auth}`, where `{url}` is URL-encoded path to a resource and `{auth}` is (optional) URL-encoded `Authorization` header value.

Do not rely on response headers as the method does not copy them from original request. Original request is assumed successful on any HTTP status 200 to 299.

Cache is purged each time terminal is restarted.

### Touchscreen

The terminal have a touchscreen, so keep in mind touchscreen mis-taps.

Scenario:

- a user taps a button;
- the page changes;
- a new button appears on the same place on the screen;
- the user still holds his finger on the touchscreen;
- suddenly another tap event is fired;
- the new button now is also clicked and changes the page again;

On page update keep buttons disabled for some time (about 200-300ms).

### UI package delivery

Delivery of the UI is done by uploading packed (zip) UI files to Goldex dashboard.

Current zip size limit is 30MiB.

### UI config

UI config is `ui-config.yaml` inside UI zip package that defines externally allowed domains and should provide emergency contacts (hardware critical failures) to show to a customer:

```yaml
# Multiline text to show to a customer (along with "Please contact support team:") in case of critical terminal failure
emergency_contacts:
  - 'Phone: <some phone number here>'
  - 'Whatever: <whatever>'
# List of allowed domains/ports to perform fetch, XMLHttpRequests, images loading, etc. (localhost[:80] is allowed by default)
host_whitelist:
  - example.com
  - example.com:8080
```

---

## Terminal API flow

There is also a [sequence diagram](/docs/images/terminal_interaction_diagram.png)

![Terminal API flow](/docs/images/terminal_api.png)
