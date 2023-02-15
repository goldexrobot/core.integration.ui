# Goldex Robot: Integration

Goldex Robot is a vending machine that evaluates gold/silver valuables, sells coins and has internal storage/safebox.

Integration with Goldex consists of two major parts: [backend](https://github.com/goldexrobot/core.integration.backend) integration and UI integration.

This document covers UI integration.

## TL;DR

Goldex Robot machine serves HTML UI (zipped SPA where everything needed is included).

UI communicates with a local JSONRPC API to control the machine hardware. Other end of the UI calls its business backend.

There are some limitations, unlike the usual website development (details below).

Standard UI flow is described at the end of the page.

[Swagger](https://goldexrobot.github.io/core.integration.ui/) describes local API.

![Goldex environment](/docs/images/goldex_env.png)

---

## UI

Goldex Robot displays customer UI on the screen. UI is an HTML SPA (single page application) and is served locally.

Locally the machine exposes an API that allows to utilize hardware of the machine, interact with a business backend, etc.

UI package must contain `index.html` and `manifest.yaml`. Index is an entry point for the UI and a manifest file contains settings for the UI (see below).

WebKit engine is used to serve HTML. There are some limitations:

- The machine has a touchscreen, so please keep in mind double-taps and mis-taps (details below);
- Provide all required resources locally, i.e. JS, CSS, icons, etc.;
- Do not embed huge resources like video into the UI package;
- Do not use transparent video;
- WebGL **might** be available;
- Java is not available;
- Browser cache is available (don't forget about CORS);

---

## API

API is served along with UI HTML - localhost. It exposes **methods** to control the terminal from the UI and sends **events** to notify the UI.

API is a [JSONRPC 2](https://www.jsonrpc.org/specification) API over [Websocket](https://en.wikipedia.org/wiki/WebSocket) connection (`http://localhost:80/ws`).

[JSONRPC 2 batch](https://www.jsonrpc.org/specification#batch) requests are not supported. Moreover, hardware-related methods should be called sequently, error will be returned otherwise.

---

## More

### Touchscreen

The machine has a touchscreen, so keep in mind touchscreen mis-taps.

In contrast to the development of a regular website, you need to take into account the almost instantaneous page loading speed. 

The user may not have time to remove their finger from the screen, which may provoke a second tap.

It is best to block buttons/controls immediately after appearing on the screen (about 200-300ms) and after pressing the control.

### UI package delivery

Delivery of the UI is done by uploading packed (zip) UI files to the Goldex dashboard.

Current size limit is 30 MiB.

Goldex machine tries to load a new package every time it is restarted. Browser cache is cleared if a new package is loaded.

### Manifest

UI config is `manifest.yaml` inside the UI zip package.

It defines whitelist of domains the UI is allowed to access, and some emergency information to show to the customer in case of machine failure (support phone, email, website, etc.):

```yaml
# Text lines to show to a customer (along with "Please contact support team").
emergency_contacts:
- 'Phone: <some phone number here>'
# Allowed domains/ports to perform fetch, XMLHttpRequests, images loading etc.
# Localhost (80) is allowed by default.
host_whitelist:
- foo.example.com  # implicitly expands to 'foo.example.com:80' and 'foo.example.com:443'
- 8.8.8.8:8080     # explicit port 8080
```

---

## Default flow

Here how UI should utilize API methods to perform item evaluation.

There is also a [sequence diagram](/docs/images/terminal_interaction_diagram.png)

![Terminal API flow](/docs/images/terminal_api.png)
