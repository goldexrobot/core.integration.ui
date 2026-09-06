# GR: UI integration

Goldex Robot is a vending machine that evaluates gold and silver valuables, sells coins, and includes internal storage and a safe.

This document covers UI integration.

| Machine type | API docs                                                                        |
|--------------|---------------------------------------------------------------------------------|
| Bot          | [API](https://goldexrobot.github.io/core.integration.ui/#bot-customer-api)      |
| Vending      | [API](https://goldexrobot.github.io/core.integration.ui/#vending-customer-api)  |

## TL;DR

The machine serves an HTML UI (a zipped SPA with all required assets included) in a WebKit browser.

The UI communicates over the `JSONRPC + WebSocket` API to control the machine hardware.

There are some **limitations** compared with typical web development.

---

## UI

Goldex Robot displays a UI on the machine's screen. The UI is an HTML SPA (single-page application) and is served locally.

Locally, the machine exposes a UI API (`JSONRPC + WebSocket`) that allows the app to use the machine hardware.

The UI package must contain `index.html` and `manifest.yaml`. `index.html` is the entry point for the UI. The manifest file contains the UI settings and the host allowlist.

The WebKit engine is used to serve HTML.

### Limitations

- The machine has a touchscreen (single-touch), so please keep in mind double taps and mis-taps (details below);
- Provide all required resources locally, including JavaScript, CSS, icons, etc.;
- Do not embed large resources such as video into the UI package;
- Do not use transparent video;
- Browser cache is available;
- Java, file access, modal dialogs, and storage (except local storage) are not available;

---

## UI API

The UI API is served alongside the UI HTML locally. It exposes **methods** to control the terminal from the UI and sends **events** to notify the UI.

The API is a [JSON-RPC 2](https://www.jsonrpc.org/specification) API over a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection (`http://localhost:80/ws`).

[JSON-RPC 2 batch](https://www.jsonrpc.org/specification#batch) requests are not supported. In addition, hardware-related methods should be called sequentially; otherwise, an error will be returned.

---

## More

### Touchscreen

The machine has a touchscreen, so you need to account for accidental touches and mis-taps.

Unlike regular website development, you also need to account for near-instant page loading.

The user may not have time to lift their finger from the screen, which could trigger a second tap.

It is best to disable buttons or controls immediately after they appear on the screen (about 200-300 ms) and again after a control is pressed.

### UI package delivery

The UI is delivered by uploading a packed (zipped) UI package to the Goldex dashboard.

The current size **limit is 30 MiB**.

The Goldex machine tries to load a new package every time it is restarted. The browser cache is cleared when a new package is loaded.

### Manifest

The UI configuration is in `manifest.yaml` inside the UI zip package.

It defines the whitelist of domains the UI is allowed to access, as well as emergency information to show the customer in case of a machine failure (support phone, email, website, etc.):

```yaml
# Manifest version
version: 1
# Text lines to show to a customer (along with "Please contact support team").
emergency_contacts:
- 'Phone: <some phone number here>'
# Allowed domains/ports to perform fetch, XMLHttpRequests, image loading, etc.
# Localhost (80) is allowed by default.
host_whitelist:
- foo.example.com  # implicitly expands to 'foo.example.com:80' and 'foo.example.com:443'
- 8.8.8.8:8080     # explicit port 8080
```
