# VALDE / Desert Samurai frontend

Static Netlify frontend paired with [Ahmet2001/gamefi-backend](https://github.com/Ahmet2001/gamefi-backend).

## API / cookie connection

The root `_redirects` file sends `/api/*` to the Railway Flask backend without changing the browser-visible origin. All three HTML entry points now use `const API_URL = "/api"`; the Phaser client posts training signals to `/api/game/feedback`. This avoids the browser's third-party-cookie restrictions on direct Netlify-to-Railway requests.

**Important**: the Netlify publish directory must include `_redirects`. If you set a non-root publish directory or build step, copy `_redirects` into the published output. Use `netlify dev` when testing locally, otherwise a plain static server cannot provide `/api` rewriting.

## Deployment order

1. Rotate the exposed database credential and JWT signing key in Supabase/Railway; set `DATABASE_URL` and `SECRET_KEY` in Railway environment variables.
2. Deploy the matching backend PR; confirm `GET /healthz` on Railway.
3. Deploy this frontend PR; verify `GET https://valdegamefi.netlify.app/api/healthz` returns JSON with `status: "ok"` (not HTML or 404).
4. From the Netlify site, sign into Phantom, then check `/api/auth/me`. The session cookie should belong to the Netlify site and be HttpOnly/Secure/Lax.
5. Create a character, return to the menu, and use Resume. Open the game and click **APPROVE** or **DISCIPLINE**. `GET /api/game/feedback` (when logged in) should show increased `events`.

Changing the JWT signing key will log out previous sessions. The game still has no real level-completion system; its training feedback is now persisted, but reaching a new level automatically is not implemented.
