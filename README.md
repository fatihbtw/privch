# Privch

Privch (**Priv**ate + **T**witch) is a privacy-focused alternative front-end to Twitch, forked from [Twineo](https://codeberg.org/CloudyyUw/twineo) (itself inspired by [Invidious](https://github.com/iv-org/invidious) and [Nitter](https://github.com/zedeus/nitter)). The server proxies every request to Twitch, so no JavaScript fingerprinting or IP tracking by Twitch happens while you watch.

## Features

- **No trackers** — all media and API requests go through the server, not your browser directly to Twitch.
- **Ad-blocking** — Twitch's stitched-in ad segments are stripped from the HLS playlist server-side before they ever reach the player.
- **Follow channels without an account** — favorites are stored in `localStorage`, with JSON export/import, no sign-up required.
- **Adjustable stream quality** — picks from the qualities actually available in the stream (including native high-bitrate "Source"), remembers your preference.
- **Resizable chat panel** — drag to resize the chat box to whatever size fits your layout.
- **Channel suggestions** — see other live channels in the same category as the one you're watching, with live viewer counts.
- **Live chat** — proxied via WebSocket, no separate Twitch login needed.
- **Open-source** — AGPLv3, inspect, modify, and self-host freely.

## Tech stack

- Backend: TypeScript + Node.js (Express) — `src/`
- Frontend: SolidJS + TailwindCSS + DaisyUI — `front/`
- Player: hls.js

## Running it yourself

Requires Node 20+.

```bash
npm install
npm run build:all
node build/src/setup_node.js
node build/src/index.js
```

The server listens on port `3000`. Optional environment variables (see `.env.example`):

- `CLIENTID` — override the Twitch client ID used for API requests.
- `USERAGENT` — override the user agent sent to Twitch.
- `INSTANCE_URL` — base URL used for embedded clip links.

### Docker

```bash
docker build -t privch .
docker run -p 3000:3000 privch
```

If you put this behind a reverse proxy, make sure it forwards WebSocket `Upgrade`/`Connection` headers — chat depends on a raw WS upgrade on the same port.

## Disclaimer

All content shown is hosted by Twitch; any takedown or DMCA requests should go to Twitch directly. Privch is not affiliated with Twitch.

## License

AGPLv3 — see [LICENSE](LICENSE). Originally based on [Twineo](https://codeberg.org/CloudyyUw/twineo) by CloudyyUw.
