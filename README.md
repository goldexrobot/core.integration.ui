# GR: UI integration

Goldex Robot is a vending machine that evaluates gold/silver valuables, sells coins and has internal storage/safebox.

This document covers UI integration.

[<img src="/docs/images/swagger-button.png" alt="Swagger" width="120"/>](https://goldexrobot.github.io/core.integration.ui/)

## TL;DR

Machine serves HTML UI (zipped SPA where everything needed is included) in WebKit browser.

The UI communicates over WebSocket with a local JSONRPC API to control the machine hardware.

There are some limitations, unlike the usual website development (details below).

---

## UI

Goldex Robot displays UI on the machine's screen. UI is an HTML SPA (single page application) and is served locally.

Locally the machine exposes a UI API that allows to use hardware of the machine.

UI package must contain `index.html` and `manifest.yaml`. Index is an entry point for the UI and a manifest file contains settings for the UI (see below).

WebKit engine is used to serve HTML.

### Limitations

- The machine has a touchscreen (single-touch), so please keep in mind double-taps and mis-taps (details below);
- Provide all required resources locally, i.e. JS, CSS, icons, etc.;
- Do not embed huge resources like video into the UI package;
- Do not use transparent video;
- Browser cache is available (don't forget about CORS);
- Java, file access, modal dialogs, storage (except local storage) are NOT available;

---

## UI API

UI API is served along with UI HTML - at localhost. It exposes **methods** to control the terminal from the UI and sends **events** to notify the UI.

The API is a [JSONRPC 2](https://www.jsonrpc.org/specification) API over [Websocket](https://en.wikipedia.org/wiki/WebSocket) connection (`http://localhost:80/ws`).

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

Current size **limit is 30 MiB**.

Goldex machine tries to load a new package every time it is restarted. Browser cache is cleared if a new package is loaded.

### Manifest

UI config is `manifest.yaml` inside the UI zip package.

It defines whitelist of domains the UI is allowed to access, and some emergency information to show to the customer in case of machine failure (support phone, email, website, etc.):

```yaml
# Manifest version
version: 1
# Text lines to show to a customer (along with "Please contact support team").
emergency_contacts:
- 'Phone: <some phone number here>'
# Allowed domains/ports to perform fetch, XMLHttpRequests, images loading etc.
# Localhost (80) is allowed by default.
host_whitelist:
- foo.example.com  # implicitly expands to 'foo.example.com:80' and 'foo.example.com:443'
- 8.8.8.8:8080     # explicit port 8080
```
