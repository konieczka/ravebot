# TechnoBot 🤖🎛️

A pixel-art robot DJ that live-codes techno in [Strudel](https://strudel.cc) with an LLM and mixes the tracks into one continuous set.

## Run it

```sh
pnpm install
pnpm dev
```

Open the page and press **WAKE UP TECHNOBOT**. Without any configuration the bot runs in **offline mode**: it remixes its built-in seed tracks layer by layer, so you can work on the UI and the mixer without an LLM. The **Track source** switch (AI generated / Local crate) forces the same local mode at any time, even with a gateway configured.

## Connect an LLM (Cloudflare AI Gateway)

Copy `.env.example` to `.env` and fill it in (for `wrangler dev`/production use `.dev.vars` or `wrangler secret put`):

| Variable           | Purpose                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CF_ACCOUNT_ID`    | Account that owns the gateway. Unset = offline mode.                                                                                              |
| `CF_AI_GATEWAY_ID` | Gateway id, defaults to `default`.                                                                                                                |
| `CF_AIG_TOKEN`     | Only for authenticated gateways (`cf-aig-authorization`).                                                                                         |
| `LLM_API_KEY`      | Provider key (`Authorization: Bearer`). For `workers-ai/*` models, a Cloudflare API token with Workers AI permission. Omit with BYOK stored keys. |
| `LLM_MODEL`        | `{provider}/{model}`, default `workers-ai/@cf/qwen/qwen2.5-coder-32b-instruct`.                                                                   |

Requests go to the gateway's OpenAI-compatible endpoint `https://gateway.ai.cloudflare.com/v1/{account}/{gateway}/compat/chat/completions`, so you can swap models and providers via `LLM_MODEL` alone.

## How it works

```
Controls ─► DjBrain (src/lib/dj/brain.svelte.ts) ─► /api/generate ─► AI Gateway ─► Qwen
               │  queue · timing · tempo glide           │ prompt + validate + retry
               ▼                                         ▼
          Mixer + Strudel engine  ◄──── validated + dry-run JSON track (5 layers)
          (src/lib/engine)
```

- **Tracks are 6 layers** (`kick`, `hats`, `perc`, `bass`, `synth`, `vox`), each a single Strudel expression. `vox` holds vocal shots and FX from Dirt-Samples (`rave:0` "are you ready", `numbers`, `speakspell`, `hoover`, `metal`...) or vowel-filtered synth chants. The LLM returns JSON; see `src/lib/server/prompt.ts` for the cheat sheet and rules it gets.
- **Safety:** layers are evaluated as JS in the browser, so `src/lib/dj/validate.ts` parses each one with acorn and only allows calls to an allowlist of Strudel globals and pattern methods, plus literals, arithmetic and `x => …` callbacks. It runs on the server and again in the browser.
- **Musical lint:** the same validator rejects made-up sounds/banks, drums in the wrong layer (e.g. a snare in `kick`), glued rests (`cp~`) and signals called as functions, and repairs unbalanced mini-notation brackets. The server feeds lint errors back to the model and retries (up to 3 calls), rejects tracks that copy the prompt's example or the previous track, uses JSON-schema mode where the provider supports it, and caps replies at 600 tokens so repetition loops fail fast.
- **Arrangement:** every track is 128 bars, and layer code is a full-energy loop. `src/lib/dj/arrangement.ts` arranges it per event against the track's own timeline: groove (drums + bass), lift (+ synth), main (+ vox), a 16-bar breakdown (kick and bass out, DJ low-pass opening), an 8-bar build (a drum roll speeding from quarters to 32nds, a noise riser, a high-pass sweep, one beat of silence), the drop with a crash + sub boom, a 32-bar peak, then the 16-bar mix-out. Each genre has its own arc style (dub swells with no roll or gap, acid keeps its 303 line in the breakdown, hard techno pumps the sidechain hardest). Held tracks loop main → breakdown → peak. Layer code runs in track time (`.late(origin)`), so `<...>` sequences and `.lastOf(8, ...)` fills line up with phrases, and it can read `arc`, the track's 0..1 intensity, e.g. `.lpf(arc.range(300, 3000))`.
- **Dry run:** before a track is queued, every layer is compiled and queried for 4 bars without playing (`engine.dryRun`). Runtime errors, empty patterns and unknown sounds/banks are caught, and broken layers are replaced by the current track's layer (or the whole track by the backup crate).
- **Seamless mixing:** both decks play inside one `stack(...)`. Each layer gets `.postgain(signal(t => gain(deck, layer, t)))` (crossfade × arrangement), its deck's DJ filter (`djf`) and an orbit, so the kick can sidechain the deck's bass/synth/vox (`duckorbit`), so the crossfade is computed per event at its exact cycle position with a single `evaluate()` per transition. Hats/perc blend in first, then the synth, and kick + bass swap hard on the middle downbeat, the way a DJ swaps bass with the EQ. Transitions start on 4-bar phrase boundaries.
- **Controls:** track source (AI or local crate), subgenre, BPM (the app owns the tempo and glides at ~0.4 BPM/s), AI-only settings (energy, weirdness, which also raises the LLM temperature, and a free-text crowd request), skip, hold, and per-layer locks that carry a layer through the next transition (and keep it in through breakdowns).

## Scripts

- `pnpm dev`: dev server
- `pnpm test`: unit tests (validator, prompt)
- `pnpm check`: svelte-check + wrangler types
- `pnpm build && pnpm preview`: production build on the Workers runtime
- `pnpm exec wrangler deploy`: deploy to Cloudflare Workers

## License

Strudel is AGPL-3.0-or-later, and TechnoBot bundles it, so TechnoBot must be distributed under the AGPL as well. Publish the source alongside the deployed app.
