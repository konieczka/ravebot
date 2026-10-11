<script lang="ts">
	import type { Mood } from '#lib/dj/brain.svelte.js';

	let { cycle, mood, accent }: { cycle: number; mood: Mood; accent: string } = $props();

	// Beat-locked motion: everything is derived from Strudel's cycle position.
	const beat = $derived(Math.floor(cycle * 4));
	const phase = $derived(cycle * 4 - beat);
	const moving = $derived(mood !== 'idle');
	const bob = $derived(moving ? (phase < 0.25 ? 1 : 0) : 0);
	const armUp = $derived(mood === 'groove' && Math.floor(cycle) % 2 === 0 && beat % 2 === 0);
	const handShift = $derived(mood === 'mix' ? beat % 2 : 0);
	const scan = $derived(Math.floor((cycle * 8) % 6));
	const glitchJitter = $derived(mood === 'glitch' ? ((beat * 7) % 3) - 1 : 0);

	const eyeColor = $derived(mood === 'glitch' ? '#ff3b3b' : mood === 'idle' ? '#3b4466' : accent);
	const antenna = $derived(
		mood === 'think' ? (beat % 2 ? '#ffe14d' : '#7a6a1a') : phase < 0.5 ? accent : '#2a2f4a'
	);
</script>

<svg
	class="robot"
	viewBox="0 0 40 34"
	shape-rendering="crispEdges"
	role="img"
	aria-label="TechnoBot, the pixel robot DJ, currently {mood}"
>
	<g transform="translate({glitchJitter} {bob})">
		<!-- antenna -->
		<rect x="19" y="1" width="2" height="4" fill="#454b6b" />
		<rect x="18" y="0" width="4" height="2" fill={antenna} />

		<!-- headphones band -->
		<rect x="9" y="4" width="22" height="2" fill="#1a1530" />
		<rect x="10" y="3" width="20" height="1" fill="#ff2e88" />

		<!-- head -->
		<rect x="10" y="5" width="20" height="13" fill="#0d0b1a" />
		<rect x="11" y="6" width="18" height="11" fill="#9aa4c7" />
		<rect x="11" y="6" width="18" height="2" fill="#c3cae6" />
		<rect x="11" y="15" width="18" height="2" fill="#6b7398" />

		<!-- visor -->
		<rect x="12" y="9" width="16" height="5" fill="#11131f" />
		{#if mood === 'think'}
			<rect x={13 + scan * 2} y="11" width="3" height="1" fill={eyeColor} />
		{:else if mood === 'glitch'}
			<rect x="14" y="10" width="1" height="1" fill={eyeColor} /><rect
				x="16"
				y="10"
				width="1"
				height="1"
				fill={eyeColor}
			/>
			<rect x="15" y="11" width="1" height="1" fill={eyeColor} />
			<rect x="14" y="12" width="1" height="1" fill={eyeColor} /><rect
				x="16"
				y="12"
				width="1"
				height="1"
				fill={eyeColor}
			/>
			<rect x="23" y="10" width="1" height="1" fill={eyeColor} /><rect
				x="25"
				y="10"
				width="1"
				height="1"
				fill={eyeColor}
			/>
			<rect x="24" y="11" width="1" height="1" fill={eyeColor} />
			<rect x="23" y="12" width="1" height="1" fill={eyeColor} /><rect
				x="25"
				y="12"
				width="1"
				height="1"
				fill={eyeColor}
			/>
		{:else if mood === 'groove'}
			<!-- happy ^ ^ eyes -->
			<rect x="14" y="11" width="1" height="1" fill={eyeColor} /><rect
				x="15"
				y="10"
				width="1"
				height="1"
				fill={eyeColor}
			/>
			<rect x="16" y="11" width="1" height="1" fill={eyeColor} />
			<rect x="23" y="11" width="1" height="1" fill={eyeColor} /><rect
				x="24"
				y="10"
				width="1"
				height="1"
				fill={eyeColor}
			/>
			<rect x="25" y="11" width="1" height="1" fill={eyeColor} />
		{:else}
			<rect x="14" y="10" width="3" height={mood === 'mix' ? 2 : 3} fill={eyeColor} />
			<rect x="23" y="10" width="3" height={mood === 'mix' ? 2 : 3} fill={eyeColor} />
		{/if}

		<!-- ear cups -->
		<rect x="7" y="8" width="4" height="7" fill="#0d0b1a" />
		<rect x="8" y="9" width="2" height="5" fill="#ff2e88" />
		<rect x="29" y="8" width="4" height="7" fill="#0d0b1a" />
		<rect x="30" y="9" width="2" height="5" fill="#ff2e88" />

		<!-- neck -->
		<rect x="17" y="18" width="6" height="2" fill="#454b6b" />
	</g>

	<!-- torso (does not bob, the head nods) -->
	<rect x="9" y="20" width="22" height="14" fill="#0d0b1a" />
	<rect x="10" y="21" width="20" height="13" fill="#6b7398" />
	<rect x="10" y="21" width="20" height="2" fill="#9aa4c7" />
	<rect x="17" y="25" width="6" height="4" fill="#11131f" />
	<rect x="18" y="26" width="4" height="2" fill={phase < 0.5 && moving ? accent : '#2a2f4a'} />

	<!-- arms -->
	{#if armUp}
		<rect x="31" y="12" width="3" height="10" fill="#0d0b1a" />
		<rect x="32" y="13" width="1" height="9" fill="#9aa4c7" />
		<rect x="30" y="9" width="5" height="4" fill="#0d0b1a" />
		<rect x="31" y="10" width="3" height="2" fill="#c3cae6" />
	{:else}
		<rect x={31 + handShift} y="21" width="3" height="13" fill="#0d0b1a" />
		<rect x={32 + handShift} y="22" width="1" height="12" fill="#9aa4c7" />
	{/if}
	<rect x={6 - handShift} y="21" width="3" height="13" fill="#0d0b1a" />
	<rect x={7 - handShift} y="22" width="1" height="12" fill="#9aa4c7" />
</svg>

<style>
	.robot {
		width: 100%;
		height: auto;
		image-rendering: pixelated;
		display: block;
		filter: drop-shadow(0 0 18px color-mix(in srgb, var(--accent) 35%, transparent));
	}
</style>
