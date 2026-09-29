# Implementation Plan: Kid Login with Photo, and App Logo Upload

**Branch**: `002-kid-login-and-logo` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/js/profiles.js` owns profiles, sign-in state, password hashing (WebCrypto SHA-256 with a
per-profile salt), the app logo, and image shrinking. `web/js/login.js` renders the main page.
`web/js/store.js` and `web/js/db.js` scope kid data by the signed-in profile id.
`MainActivity.onShowFileChooser` makes `<input type="file">` work in the WebView.

## Technical Context

**Language/Version**: JavaScript ES modules; Kotlin for the file chooser

**Primary Dependencies**: WebCrypto `crypto.subtle` (needs a secure context: the asset loader's https origin)

**Storage**: localStorage `jia.profiles`, `jia.currentUser`, `jia.appLogo`; per-player keys `jia.u.<id>.*`; IndexedDB items carry `userId`

**Testing**: `tests/shell.spec.js` (sign up, wrong password, photo + logo upload), `tests/tabs.spec.js` (data isolation)

## Constitution Check

| Gate | Status |
| --- | --- |
| Kid-First: big photo cards, friendly messages | ✅ |
| Offline & Private: local only, hashed passwords | ✅ |
| Grown-Ups in Control: logo, password reset, delete behind PIN | ✅ |
| Tested: Playwright journeys | ✅ |

## Project Structure

```text
web/js/profiles.js    profiles, hashing, logo, readImageFile()
web/js/login.js       main page: logo, "Who is playing?", new player sheet
web/js/app.js         shows login until signed in; avatar menu with log out
web/js/grownups.js    logo upload/reset, players (reset password, delete)
android/.../MainActivity.kt   onShowFileChooser → system picker
```
