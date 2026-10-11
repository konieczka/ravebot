import type { LayerName } from '#lib/dj/types.js';

/** Playback voices also cover saved tracks and generated patterns using the older recipes. */
export function hardbassVoice(
	layer: LayerName | 'strike',
	value: Record<string, unknown>,
	drive = 0.1
) {
	if (layer === 'vox' && value.s === 'rus') {
		// Keep speech at its recorded pitch. Generated distortion, formant filtering and
		// modulation can make even the natural recordings sound robotic.
		const voice = { ...value };
		for (const key of [
			'shape',
			'shapevol',
			'distort',
			'distortvol',
			'distorttype',
			'crush',
			'coarse',
			'vowel',
			'vibrato',
			'vibmod',
			'tremolo',
			'phaserrate'
		])
			delete voice[key];
		for (const key of Object.keys(voice)) if (key.startsWith('fm')) delete voice[key];
		return { ...voice, speed: 1, accelerate: 0 };
	}
	const gain = typeof value.gain === 'number' ? value.gain : 0.8;
	if (layer === 'kick' || layer === 'strike') {
		// Retain dynamics, but discard sample tuning, FX and envelopes. The pattern owns timing.
		// Restore punch lost when replacing the hot sampled kicks with a clean oscillator.
		// Lift body and strike together, retaining the pattern's relative accents and silence.
		const dynamics = { gain: gain * 2 * 10 ** (8 / 20), velocity: value.velocity ?? 1 };
		if (layer === 'strike')
			return {
				...dynamics,
				s: 'white',
				attack: 0.0005,
				decay: 0.004,
				sustain: 0,
				release: 0.002
			};
		return {
			...dynamics,
			s: 'sine',
			note: 33,
			penv: 24,
			pattack: 0.001,
			pdecay: 0.035,
			psustain: 0,
			prelease: 0.001,
			pcurve: 1,
			attack: 0.001,
			decay: 0.15,
			sustain: 0,
			release: 0.008,
			shape: drive * 0.15
		};
	}
	// Leave non-FM bass layers (e.g. the quiet saw top in a hybrid) intact.
	if (layer !== 'bass' || typeof value.fmi !== 'number') return value;
	const out = { ...value };
	for (const key of Object.keys(out)) {
		if (
			/^(fm|penv|pattack|pdecay|psustain|prelease|pcurve)/.test(key) ||
			[
				'shape',
				'shapevol',
				'distort',
				'distortvol',
				'distorttype',
				'crush',
				'coarse',
				'noise'
			].includes(key)
		)
			delete out[key];
	}
	return {
		...out,
		s: 'sine',
		fmi: Math.max(1.5, Math.min(3, value.fmi)),
		fmh: 2,
		fmwave: 'sine',
		fmattack: 0.001,
		fmdecay: 0.065,
		fmsustain: 0,
		fmrelease: 0.008,
		fmenv: 'lin',
		attack: 0.001,
		decay: 0.15,
		sustain: 0,
		release: 0.008,
		cutoff: 3200,
		resonance: 0.7,
		room: 0,
		delay: 0,
		dry: 1
	};
}
