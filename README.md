# Goldex Robot: Integration

Goldex Robot is a vending machine that evaluates gold/silver valuables, sells coins and has internal storage/safebox.

Integration with Goldex consists of two major parts: [backend](https://github.com/goldexrobot/core.integration.backend) integration and UI integration.

This document covers UI integration.

## TL;DR

Goldex Robot machine serves HTML UI (zipped SPA where everything needed is included).

UI communicates with a local JSONRPC API to control the machine hardware. Other end of the UI calls to the business backend.

There are some limitations, unlike the usual website development (details below).

Standard UI flow is described at the end of the page.

[Swagger](https://goldexrobot.github.io/core.integration.ui/) describes local API.

![Goldex environment](/docs/images/goldex_env.png)

---

## UI

Goldex Robot terminal displays customer UI on the screen. UI is an HTML SPA (single page application) and is served locally.

The robot exposes an API that allows a developer to access the hardware, interact with a business backend, etc.

UI files must contain `index.html` and `ui-config.yaml`. Index is an entry point for the UI. Config file contains a settings for the UI (see below).

WebKit engine is used to serve HTML. There are some limitations:

- The terminal has a touchscreen, so please keep in mind double-taps and mis-taps. See details below;
- Utilize all the required resources locally, i.e. JS, CSS, icons, etc., except videos;
- Do not embed huge resources like video into the UI package, use resources downloading instead (see below);
- Do not use transparent video;
- Browser database is unavailable, use local storage instead;
- PDF rendering is not supported;
- WebGL **might** be available;
- Java is not available;

---

## API

API is served locally on the terminal. It exposes **methods** to control the terminal from the UI and sends **events** to notify the UI (for instance, optional hardware could send events).

API is a [JSONRPC 2](https://www.jsonrpc.org/specification) API over [Websocket](https://en.wikipedia.org/wiki/WebSocket) connection (`http://localhost:80/ws`).

[JSONRPC 2 batch](https://www.jsonrpc.org/specification#batch) requests are not supported. Moreover, hardware-related methods should be called sequently, error will be returned otherwise.

---

## More

### Resources downloading

Goldex Robot terminal handles `GET /cached` method locally (i.e. on localhost, where UI is served) to download and cache any required runtime resources like images, videos etc.

Because of there is no a browser cache, it's recommended to use the method to get frequently used huge data once (at the startup) and then request it later with zero-time delivery.

Syntax: `GET /cached?url={url}&auth={auth}`, where `{url}` is URL-encoded path to an external HTTP resource and `{auth}` is (optional) URL-encoded `Authorization` header value.

Do not rely on response headers from the `GET /cached` method as the method does not copy headers from the original request. The original request is assumed successful on any HTTP status 200 to 299.

Cache is purged each time the terminal is restarted.

### Touchscreen

The terminal have a touchscreen, so keep in mind touchscreen mis-taps.

Scenario:

- a user sees a page on the screen;
- the user taps a button;
- the page got changed;
- a new button appears on the same place on the screen;
- the user still holds his finger on the touchscreen;
- suddenly another tap event is fired;
- the new button now is also get tapped and that leads to unwanted UI behavior;

Solution is to keep buttons disabled for some time (about 200-300ms) on a page loading.

### UI package delivery

Delivery of the UI is done by uploading packed (zip) UI files to the Goldex dashboard.

Current zip size limit is 30MiB.

Goldex terminal downloads a fresh package each time it restarts.

### UI config

UI config is `ui-config.yaml` inside the UI zip package.

It defines externally allowed domains (whitelist) and should contain emergency contacts (support phone, email, website, etc.):

```yaml
# Text lines to show to a customer (along with "Please contact support team:") in case of critical terminal failure:
emergency_contacts:
  - 'Phone: <some phone number here>'
  - 'Whatever: <whatever>'
# List of allowed domains/ports to perform fetch, XMLHttpRequests, images loading, GET /cache, etc. (localhost[:80] is allowed by default)
host_whitelist:
  - example.com
  - example.com:8080
```

---

## Default flow

Here how UI should utilize API methods to perform item evaluation.

There is also a [sequence diagram](/docs/images/terminal_interaction_diagram.png)

![Terminal API flow](/docs/images/terminal_api.png)
