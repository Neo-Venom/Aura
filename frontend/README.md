# Aura — frontend

React 19 + TypeScript (strict) + Tailwind, built on Create React App (craco).
Because the template uses CRA, the spec's `VITE_*` variables use the `REACT_APP_*` prefix.

## Environment (`frontend/.env`)

| Variable | Meaning |
|---|---|
| `REACT_APP_USE_MOCKS` | `true` → mock adapters backed by `localStorage` (no server). `false` → HTTP adapters. |
| `REACT_APP_API_BASE_URL` | Base URL for the real API, e.g. `https://api.example.com` (paths below are appended). |
| `REACT_APP_ENABLE_GOOGLE_LOGIN` | `true` shows "Continue with Google". |
| `REACT_APP_STT_MODE` | `browser` (Web Speech API, default) or `server` (MediaRecorder → `POST /v1/stt/transcribe`). |

Restart the dev server after editing `.env`.

## Switching from mocks to the real API

1. Set `REACT_APP_USE_MOCKS=false` and `REACT_APP_API_BASE_URL=<your API origin>`.
2. Implement the endpoints marked `// TODO(Antigravity)` in `src/services/*.ts`.
3. All HTTP calls go through `apiFetch()` in `src/services/http.ts`: it attaches
   `Authorization: Bearer <token>` and maps `{ "error": { code, message, request_id } }` to `ApiError`.
4. Chat streaming (`POST /v1/chat/sessions/:id/messages`) must return `text/event-stream`, one
   `StreamEvent` JSON per `data:` line (`meta` first, `done` last). It should be idempotent on `client_message_id`.

Types shared with the backend live in `src/types/api.ts`.

## Mock QA triggers (mock mode only)

- `[test-high]` in a message → inline crisis card.
- `[test-imminent]` → inline crisis card + crisis modal opens once.
- `[test-error]` → send fails (shows Retry). `[test-limit]` → "Aura needs a little rest" card.

## Structure

```
src/app        routes, guards, providers, store
src/pages      one file per screen
src/components feature folders (chat, shell, safety, checkin, weather, calm, settings…)
src/services   service interfaces + http adapters; mock/ holds localStorage adapters and seed data
src/copy/en.ts all user-facing strings
src/styles     design tokens (CSS variables) + globals
```
