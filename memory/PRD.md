# Aura — PRD (frontend only)

## Original problem statement
Build the FRONTEND ONLY of "Aura": free, warm AI emotional-support web app. Signup → consent (18+) → 29-question gentle check-in → "Your emotional weather" (radar + brightness gauge) → ChatGPT-style chat with saved sessions, streaming, stop, retry, mic (Web Speech API), Calm corner (breathing orb + 5-4-3-2-1 grounding), Settings (theme/accent/text size/voice/data), and safety UI ("Need support now?" pill, CrisisModal, inline CrisisCard on safety events). All server access via `src/services` with mock (localStorage) + http (TODO(Antigravity)) adapters. No backend, no LLM keys. Design: "soft sunlight" (cream canvas, apricot/sage/lavender/butter/sky, Nunito + Fraunces).

## User choices
- TypeScript inside CRA with `REACT_APP_` env prefix (REACT_APP_USE_MOCKS, REACT_APP_API_BASE_URL, REACT_APP_ENABLE_GOOGLE_LOGIN, REACT_APP_STT_MODE)
- Google login hidden (flag off)

## Architecture
- `src/app` (routes, guards, providers, zustand store, auth context, theme sync)
- `src/services` (interfaces + http adapters, `getServices()`), `src/services/mock` (localStorage DB, seed questionnaire/resources/replies, scoring, streaming mock LLM)
- `src/components/*` feature folders; `src/pages/*`; `src/copy/en.ts`; `src/styles/tokens.css` (CSS vars light/night + accents)
- Backend (FastAPI template) left untouched and unused.

## Implemented (2026-06)
- All routes + guards, reload persistence, lazy Calm/Weather/Settings
- Check-in with interstitials, keyboard 1–4, prefer-not, save & finish later, skip, draft resume, mock DASS scoring
- Results with radar, brightness gauge, band words, support card when safe_01 > 0
- Chat: streaming, breathing-orb thinking, stop, retry, rate-limit rest card, break reminder, tool tokens → inline tool dialog, titles, drafts, copy, jump-to-latest, finish-checkin banner
- Sidebar: grouped sessions, search, rename inline, delete confirm, mobile drawer
- Voice: browser STT with sage ripple, auto-send option, server-mode stub
- Safety: SupportPill everywhere, CrisisModal/`/crisis` with country select, tel:/sms:, INTL fallback; `[test-high]`/`[test-imminent]` triggers (plus `[test-error]`, `[test-limit]`)
- Settings: theme (light/night/system), accent picker, text size, auto-send, download JSON, delete chats, delete account (type DELETE)
- README explains switching to real API
- Weather History on /app/weather: up to 4 earlier check-ins side by side (mini radar + brightness word), `assessmentService.getHistory()` (http: GET /v1/assessment/history TODO)
- Voice language setting (profile.stt_language, NOTE: field added to Profile contract) passed to sttService.start(cb, { lang })
- Soft night polish: dusk blob palette (--blob-* tokens), warmer breathing-orb glow (--orb-* tokens)

## Backlog
- P1: Real backend wiring by Antigravity (endpoints in TODO comments); Lighthouse a11y audit pass
- P2: Translations (copy already centralised), session list pagination (cursor supported in interface)
