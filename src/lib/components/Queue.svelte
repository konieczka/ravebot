<script lang="ts">
	import { SECTIONS, TRACK_BARS, TRANSITION_BARS, type SectionKind } from '#lib/dj/arrangement.js';
	import { QUEUE_DEPTH, type DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS, genreById } from '#lib/dj/genres.js';
	import { LAYERS, type Track } from '#lib/dj/types.js';

	let { dj }: { dj: DjBrain } = $props();

	const BODY = TRACK_BARS - TRANSITION_BARS;
	const LABELS: Record<SectionKind, string> = {
		intro: 'IN',
		groove: 'GRV',
		lift: 'LIFT',
		main: 'MAIN',
		breakdown: 'BRK',
		build: 'BLD',
		peak: 'PEAK',
		outro: 'MIX'
	};
	/** The track's arc as drawn on the NOW card: the body sections, then the mix-out. */
	const ARC = [...SECTIONS, { kind: 'outro' as const, start: BODY, end: TRACK_BARS }].map((s) => ({
		kind: s.kind,
		start: s.start,
		bars: s.end - s.start,
		label: LABELS[s.kind]
	}));

	/** Cards showing the code instead of the summary. */
	let flipped = $state<Record<string, boolean>>({});

	const pos = $derived(dj.status === 'live' ? dj.mixer.position(dj.live, dj.cycle) : null);
	/** Playhead in track bars, from the section and how far into it we are. */
	const playhead = $derived.by(() => {
		if (!pos) return 0;
		const s = ARC.find((a) => a.kind === pos.kind);
		return s ? s.start + pos.x * s.bars : 0;
	});
	const mixIn = $derived.by(() => {
		if (dj.transitioning) return 'mixing…';
		if (dj.hold) return 'holding';
		const tl = dj.mixer.timelines[dj.live];
		const left = tl ? Math.ceil(tl.origin + BODY - dj.cycle) : 0;
		return left > 0 ? `mix in ${left}` : dj.next ? 'mixing soon' : 'waiting for next';
	});
	const incoming = $derived(dj.transitioning ? dj.decks[dj.live === 0 ? 1 : 0] : null);
	const open = $derived(Math.max(0, QUEUE_DEPTH - dj.queue.length - (dj.writing ? 1 : 0)));

	const code = (t: Track) => LAYERS.map((l) => `$${l}: ${t.layers[l]}`).join('\n');
	const sourceLabel = (t: Track) => (t.source === 'llm' ? 'AI' : 'CRATE');
</script>

{#snippet chip(genre: Track['genre'])}
	<span class="gchip" style:--c={GENRE_COLORS[genre]}>{genreById(genre).name}</span>
{/snippet}

{#snippet flags(t: Track)}
	{#each t.flags ?? [] as f (f)}<span class="flag">{f}</span>{/each}
{/snippet}

{#snippet queued(t: Track, tag: string, i: number)}
	<article class="card ready">
		<div class="tag"><span>{tag}</span><span class="st">READY</span></div>
		<h3>{t.title}</h3>
		<div class="meta">{@render chip(t.genre)}<span>{sourceLabel(t)}</span>{@render flags(t)}</div>
		{#if flipped[t.id]}
			<pre class="code">{code(t)}</pre>
		{:else}
			{#if i === 0}
				<div class="layers" aria-label="Layers">
					{#each LAYERS as l (l)}
						<span
							class:kept={dj.locked[l]}
							title={dj.locked[l] ? `${l}: kept from the current track` : l}
							>{l[0].toUpperCase()}</span
						>
					{/each}
				</div>
			{/if}
			{#if t.comment}<p class="quote">“{t.comment}”</p>{/if}
		{/if}
		<div class="acts">
			<button onclick={() => (flipped[t.id] = !flipped[t.id])} aria-pressed={!!flipped[t.id]}
				>{flipped[t.id] ? 'CARD' : 'CODE'}</button
			>
			<button onclick={() => dj.dropQueued(t.id)} title="Remove it; a replacement gets written"
				>DROP</button
			>
		</div>
	</article>
{/snippet}

<section class="queue" aria-label="Up next">
	<h2>UP NEXT <span>{QUEUE_DEPTH} tracks ahead · each mix is {TRANSITION_BARS} bars</span></h2>
	<div class="rail">
		{#if dj.liveTrack}
			{@const t = dj.liveTrack}
			<article class="card now">
				<div class="tag">
					<span>NOW PLAYING · DECK {dj.live === 0 ? 'A' : 'B'}</span><span class="st">LIVE</span>
				</div>
				<h3>{t.title}</h3>
				<div class="meta">
					{@render chip(t.genre)}<span>{sourceLabel(t)}</span>{@render flags(t)}
				</div>
				{#if flipped[t.id]}
					<pre class="code">{code(t)}</pre>
				{:else}
					<div class="arc" aria-hidden="true">
						{#each ARC as s (s.kind)}
							<span class:cur={pos?.kind === s.kind} class={s.kind} style:flex-grow={s.bars}
								>{s.label}</span
							>
						{/each}
						<i class="head" style:left="{(playhead / TRACK_BARS) * 100}%"></i>
					</div>
					<div class="foot">
						<span>bar {Math.max(1, Math.floor(playhead) + 1)} / {TRACK_BARS}</span><span
							>{mixIn}</span
						>
					</div>
				{/if}
				<div class="acts">
					<button onclick={() => (flipped[t.id] = !flipped[t.id])} aria-pressed={!!flipped[t.id]}
						>{flipped[t.id] ? 'ARC' : 'CODE'}</button
					>
				</div>
			</article>
		{:else}
			<article class="card now cold">
				<div class="tag"><span>NOW PLAYING</span></div>
				<h3>The decks are cold</h3>
				<p class="quote">Press WAKE UP RAVEBOT to start the set.</p>
			</article>
		{/if}

		{#if incoming}
			<div class="link" aria-hidden="true"><b></b>MIXING</div>
			<article class="card ready mixing">
				<div class="tag"><span>MIXING IN</span><span class="st">ON DECK</span></div>
				<h3>{incoming.title}</h3>
				<div class="meta">{@render chip(incoming.genre)}<span>{sourceLabel(incoming)}</span></div>
				{#if incoming.comment}<p class="quote">“{incoming.comment}”</p>{/if}
			</article>
		{/if}

		{#each dj.queue as t, i (t.id)}
			<div class="link" aria-hidden="true">
				<b></b>{i === 0 && !incoming ? `${TRANSITION_BARS} BAR MIX` : ''}
			</div>
			{@render queued(t, i === 0 && !incoming ? 'NEXT' : `+${i + 1}`, i)}
		{/each}

		{#if dj.writing}
			{@const job = dj.writing}
			<div class="link" aria-hidden="true"><b></b></div>
			<article class="card writing">
				<div class="tag">
					<span>{dj.queue.length === 0 ? 'NEXT' : `+${dj.queue.length + 1}`}</span>
					<span class="st w">WRITING<span class="cursor">_</span></span>
				</div>
				<div class="meta">{@render chip(job.genre)}</div>
				<pre class="code">{job.source === 'local'
						? '// digging the local crate'
						: `// prompting the LLM\n// ${Math.round(job.bpm)} BPM · energy ${job.energy} · weird ${job.weirdness}`}<span
						class="cursor">█</span
					></pre>
			</article>
		{/if}

		{#each Array(open) as _, i (i)}
			<div class="link" aria-hidden="true"><b></b></div>
			<article class="card open">
				<div class="tag"><span>+{QUEUE_DEPTH - open + i + 1}</span><span>OPEN</span></div>
				<p class="quote">
					{dj.status === 'live' ? 'Gets written once the track before it is ready.' : 'Empty slot.'}
				</p>
			</article>
		{/each}
	</div>
</section>

<style>
	.queue {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 14px 18px;
		background: var(--hull);
		border-top: 4px solid var(--edge);
	}
	h2 {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 4px 12px;
		font-family: var(--font-pixel);
		font-size: 9px;
		font-weight: normal;
		letter-spacing: 2px;
		color: var(--muted);
	}
	h2 span {
		font-family: var(--font-mono);
		font-size: 18px;
		letter-spacing: 0;
	}
	.rail {
		display: flex;
		align-items: stretch;
		overflow-x: auto;
		padding-bottom: 6px;
		scrollbar-color: var(--panel-hi) transparent;
	}
	.link {
		flex: 0 0 34px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-family: var(--font-pixel);
		font-size: 6px;
		text-align: center;
		color: var(--muted);
	}
	.link b {
		display: block;
		width: 100%;
		height: 3px;
		background: repeating-linear-gradient(90deg, var(--muted) 0 3px, transparent 3px 6px);
	}
	.card {
		flex: 0 0 240px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: var(--panel);
		border: 3px solid var(--edge);
		box-shadow: inset 0 3px 0 var(--panel-hi);
	}
	.card.now {
		flex-basis: 360px;
		border-color: color-mix(in srgb, var(--accent) 60%, var(--edge));
	}
	.card.cold {
		border-color: var(--edge);
	}
	.card.mixing {
		border-color: var(--pink);
	}
	.card.writing {
		border-style: dashed;
		border-color: var(--panel-hi);
	}
	.card.open {
		color: var(--muted);
		background: transparent;
		border-style: dashed;
		border-color: var(--panel-hi);
		box-shadow: none;
	}
	.tag {
		display: flex;
		justify-content: space-between;
		gap: 6px;
		font-family: var(--font-pixel);
		font-size: 7px;
		letter-spacing: 1px;
		color: var(--muted);
	}
	.st {
		color: var(--ok);
	}
	.st.w {
		color: #ffb03b;
	}
	h3 {
		margin: 0;
		font-family: var(--font-pixel);
		font-size: 11px;
		font-weight: normal;
		line-height: 1.5;
		text-wrap: balance;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-size: 18px;
		color: var(--muted);
	}
	.gchip,
	.flag {
		padding: 3px 5px;
		font-family: var(--font-pixel);
		font-size: 7px;
		text-transform: uppercase;
		color: var(--edge);
		background: var(--c);
	}
	.flag {
		color: #fff;
		background: #b3263f;
	}
	.quote {
		margin: 0;
		font-size: 18px;
		color: var(--text);
		opacity: 0.8;
	}
	.arc {
		position: relative;
		display: flex;
		gap: 2px;
		height: 18px;
	}
	.arc span {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: var(--font-pixel);
		font-size: 5px;
		color: var(--edge);
		opacity: 0.35;
		background: #7d6bd0;
	}
	.arc .groove {
		background: #4a4a7a;
	}
	.arc .lift {
		background: #5c5aa0;
	}
	.arc .breakdown {
		background: #4d8bff;
	}
	.arc .build {
		background: #ffb03b;
	}
	.arc .peak {
		background: var(--pink);
	}
	.arc .outro {
		background: var(--muted);
	}
	.arc span.cur {
		opacity: 1;
	}
	.head {
		position: absolute;
		top: -3px;
		bottom: -3px;
		width: 3px;
		margin-left: -1px;
		background: var(--text);
		box-shadow: 0 0 6px var(--text);
	}
	.foot {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		font-size: 18px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.layers {
		display: flex;
		gap: 3px;
	}
	.layers span {
		padding: 3px 4px;
		font-family: var(--font-pixel);
		font-size: 7px;
		color: var(--muted);
		background: #241d3a;
	}
	.layers span.kept {
		color: var(--edge);
		background: #ffb03b;
	}
	.code {
		margin: 0;
		min-height: 90px;
		max-height: 160px;
		overflow: auto;
		padding: 8px;
		font-family: var(--font-mono);
		font-size: 16px;
		line-height: 1.15;
		white-space: pre;
		color: var(--ok);
		background: var(--edge);
	}
	.acts {
		display: flex;
		gap: 6px;
		margin-top: auto;
	}
	.acts button {
		padding: 6px 8px;
		font-family: var(--font-pixel);
		font-size: 7px;
		color: var(--text);
		background: var(--panel-hi);
		border: 3px solid var(--edge);
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.4);
		cursor: pointer;
	}
	.acts button:hover {
		filter: brightness(1.2);
	}
	.acts button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.cursor {
		animation: blink 1s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cursor {
			animation: none;
		}
	}
</style>
