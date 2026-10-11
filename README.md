# RaveBot 🤖🎛️

A pixel-art robot DJ in a warehouse club (in Berlin, Warsaw or Paris) that live-codes techno in [Strudel](https://strudel.cc) with an LLM and mixes the tracks into one continuous set.

## Run it

```sh
pnpm install
pnpm dev
```

Open the page and press **WAKE UP RAVEBOT**. Without any configuration the bot runs in **offline mode**: it remixes its built-in seed tracks layer by layer, so you can work on the UI and the mixer without an LLM. The **Track source** switch (Local crate / Combo / AI) forces the same local mode at any time, even with a gateway configured; **Combo** alternates the two, writing local, AI, local, AI and so on.

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
          Mixer + Strudel engine  ◄──── validated + dry-run JSON track (6 layers)
          (src/lib/engine)
```

- **Subgenres:** Berlin Minimal, Acid, Hard Techno, Dub Techno, Detroit, Hypnotic, French House (Discovery-era: pumping sidechain, phaser disco loops, vocoder hooks via `.vowel()`), Psytrance (a tight kick plus a rolling bass on the three 16ths after it) and Hardbass (158 BPM: a distorted "bochka" kick sample cut right before the off-beat, a hollow 2:1 FM "donk" on every off-beat, harmonic-minor and folk melodies, and Russian shouts like "давай" bundled in `static/samples/rus/`, generated once with [Shabda](https://shabda.ndre.gr) text-to-speech). Each has 15 hand-written tracks in `src/lib/dj/seeds/`, used as LLM examples and as the local crate.
- **Tracks are 6 layers** (`kick`, `hats`, `perc`, `bass`, `synth`, `vox`), each a single Strudel expression. `vox` holds vocal shots and FX from Dirt-Samples (`rave:0` "are you ready", `numbers`, `speakspell`, `hoover`, `metal`...) or vowel-filtered synth chants. The LLM returns JSON; see `src/lib/server/prompt.ts` for the cheat sheet and rules it gets.
- **Safety:** layers are evaluated as JS in the browser, so `src/lib/dj/validate.ts` parses each one with acorn and only allows calls to an allowlist of Strudel globals and pattern methods, plus literals, arithmetic and `x => …` callbacks. It runs on the server and again in the browser.
- **Musical lint:** the same validator rejects made-up sounds/banks, drums in the wrong layer (e.g. a snare in `kick`), glued rests (`cp~`) and signals called as functions, and repairs unbalanced mini-notation brackets. The server feeds lint errors back to the model and retries (up to 3 calls), retries copied foreground motifs while permitting standard drum and supporting bass rhythms, uses JSON-schema mode where the provider supports it, and caps replies at 900 tokens. Failed pitched parts are replaced together from one seed, never spliced from unrelated tracks.
- **AI composition:** every request receives a four-bar harmonic plan and a genre-specific kick/bass contract. Minimal, acid, hard, dub and hypnotic tracks use a stable tonal centre; Detroit uses close extended major/dorian voicings, hardbass a harmonic-minor progression, and psytrance a fixed rolling bass. Compatible AI successors retain the plan. Low weirdness uses straight grids; at high weirdness only one supporting percussion part may experiment. The browser checks performed pitches, held notes, rhythmic grids, bass monophony and psy/hardbass onset positions over 16 bars before queueing a generated track. Local seed tracks retain their authored grooves and use a percussion bridge when their harmony is unknown.
- **Arrangement:** every track is 128 bars, and layer code is a full-energy loop. `src/lib/dj/arrangement.ts` arranges it per event against the track's own timeline: groove (drums + bass), lift (+ synth), main (+ vox), a 16-bar breakdown (kick and bass out, DJ low-pass opening), an 8-bar build (a drum roll speeding from quarters to 32nds, a noise riser, a high-pass sweep, one beat of silence), the drop with a crash + sub boom, a 32-bar peak, then the 16-bar mix-out. Each genre has its own arc style (dub swells with no roll or gap, acid keeps its 303 line in the breakdown, psytrance skips the sidechain because its rolling bass already dodges the kick, and French house keeps the whole groove going while the DJ low-pass closes through the breakdown and sweeps back open into the drop). Held tracks loop main → breakdown → peak. Layer code runs in track time (`.late(origin)`), so `<...>` sequences and `.lastOf(8, ...)` fills line up with phrases, and it can read `arc`, the track's 0..1 intensity, e.g. `.lpf(arc.range(300, 3000))`.
- **Dry run:** before a track is queued, every layer is compiled and queried for 16 bars without playing (`engine.dryRun`). Preparation yields to the browser between one-beat queries, and rejects excessive event density, expansion factors, unison and tails before a track can play. Runtime errors, empty patterns and unknown sounds/banks are caught, and broken layers are replaced by the current track's layer (or the whole track by the backup crate).
- **Audio timing:** RaveBot compiles patterns with Strudel but schedules playback with its own audio-clock loop (`src/lib/engine/scheduler.ts`): worker wakeups every 25 ms, a 500 ms scheduling horizon, and small query slices. Tempo changes take effect beyond already scheduled notes, so controls can take up to roughly half a second to reach the speakers. Transitions are aligned beyond that horizon. Sidechain envelopes are submitted alongside kicks as timestamped Web Audio automation, including overlapping kicks, without waiting for a main-thread callback near the beat. Browser/OS suspensions longer than the horizon can still interrupt playback; recovery advances to the current musical position instead of replaying missed notes.
- **Seamless mixing:** both decks play inside one `stack(...)`. Each layer gets `.postgain(signal(t => gain(deck, layer, t)))` (crossfade × arrangement), its deck's DJ filter (`djf`) and an orbit (drums, bass + synth and vox each get their own), so the kick can sidechain the deck's music and vocals by different amounts (`duckorbit` with per-orbit `duckdepth`; French house uses lighter, tempo-relative pumping on bass, keys and voice), so the crossfade is computed per event at its exact cycle position with a single `evaluate()` per transition. Hats/perc blend in first, then the synth, and kick + bass swap hard on the middle downbeat, the way a DJ swaps bass with the EQ. Transitions start relative to the outgoing track's phrase origin. All genres require matching chord grids and phase before overlapping melodies; unknown or incompatible harmony uses a percussion bridge.
- **French house:** 15 original loops share five explicit four-bar harmonic plans (`src/lib/dj/harmony.ts`). Bass, closely voiced keyboard chords and sparse held hooks follow one grid. AI requests and local successors inherit that plan; the browser checks performed notes over 16 bars and repairs a failed tonal group together. Bass and keys feed a shared filter/compressor/saturation bus, with full-band bass ducking and recovery in beats. The hook starts with the groove, the kick continues through the filtered breakdown, and eight-bar vocal rests create contrast. Compatible transitions use complementary melody fades and the active kick pumps both decks. Locking any tonal layer holds bass, keys and voice together across all genres. These are synthesized original phrases processed as a group, not recordings sampled from commercial tracks.
- **The club:** the top of the page is a 480×270 pixel-art canvas (`src/lib/club/scene.ts`), drawn every frame and scaled up with crisp pixels. It reads no audio: every light and dancer follows the same schedule the music uses (the beat phase of the Strudel clock, `Mixer.gain()` per layer and the arrangement section), so it stays exactly on the beat. Kick moves the crowd and the speakers, hats flick the wristbands and balcony neon, bass drives the booth underglow, synth turns on the lasers, vox lights the neon signs, and the breakdown, build, blackout and drop each get their own scene. The light show (`src/lib/club/lights.ts`) changes its looks on 4-bar phrases: moving heads fan, cross, sweep, chase or close in on RaveBot and light up the crowd's heads; the lasers sweep in the groove, lay a sheet over the crowd in the breakdown, close in like a tunnel through the build, burst on the drop and scan in 16ths at the peak; blinders hit on the drop. A soft bloom glows round every light, and when the energy is up the picture shakes on the kick (hardest on the drop, never in the breakdown, and not at all with reduced motion). On phones the canvas is cropped to the booth.
- **Stages:** the club can stand in Berlin, Warsaw or Paris (`src/lib/club/cities/`). Each city brings its own view through the back window (landmarks, a train or tram crossing a river bridge, things that blink and sparkle on the beat), neon slogans and banners in the local language, the sticker on the booth, and its own club around the stage: an old power station in Berlin (control panel and generator), a red-brick vodka distillery in Warsaw (copper still, rescued neon signs) and an Art Nouveau hall in Paris (Guimard Métro entrance, café terrace). Their machines, lamps and signs run on the music too. The choice is remembered in the browser.
- **Queue:** the brain writes up to 3 tracks ahead, one at a time, each following the last one queued. Cards show the playing track's arc, the queued tracks (flip to read the code, or drop one to have it rewritten) and the one being written. Changing subgenre, source, energy or weirdness rewrites the queue.
- **Controls:** track source (local crate, combo alternating both — the default — or AI), subgenre, BPM (the app owns the tempo and glides at ~0.4 BPM/s), AI-only settings (energy and weirdness, which gates composition techniques while LLM temperature stays at 0.45), skip, hold, and the stage switcher.

## Scripts

- `pnpm dev`: dev server
- `pnpm test`: unit tests (validator, prompt)
- `pnpm check`: svelte-check + wrangler types
- `pnpm build && pnpm preview`: production build on the Workers runtime
- `pnpm exec wrangler deploy`: deploy to Cloudflare Workers

## License

Strudel is AGPL-3.0-or-later, and RaveBot bundles it, so RaveBot must be distributed under the AGPL as well. Publish the source alongside the deployed app.
