import { FRENCH_HARMONIES, type HarmonyId } from '../harmony';
import type { Seed } from './types';

// Original, replayable disco phrases. Chords, bass and hook share the same bar grid;
// adjacent keyboard voicings retain common tones. Texture evolves on the music bus.
const TITLES = [
	'One More Byte',
	'Digital Glove',
	'Aerodynamic Croissant',
	'Chromed Disco Ball',
	'Face to Faders',
	'Something About Synths',
	'Nightvision Rollerdisco',
	'Helmet Hair Day',
	'Short Circuit Romance',
	'Veridis Quoi',
	'Around the Word Processor',
	'Lady, Hear Me Reboot',
	'Love Generator',
	'Nostalgia Dot Exe',
	'Spinal Glitch'
];
const octave = (note: string, shift: number) =>
	note.replace(/\d$/, (n) => String(Number(n) + shift));
const phrase = (bars: string[]) => `<${bars.map((b) => `[${b}]`).join(' ')}>`;

function makeSeed(harmony: HarmonyId, variation: number, title: string): Seed {
	const { roots, chords } = FRENCH_HARMONIES[harmony];
	const keyboard = phrase(
		chords.map((notes) => {
			const chord = `[${notes.join(',')}]`;
			return [`${chord}@3 ~ ${chord}@3 ~`, `~ ${chord}@3 ${chord}@3 ~`, `${chord}@5 ~ ${chord} ~`][
				variation
			];
		})
	);
	const bass = phrase(
		roots.map((root, bar) => {
			const upper = octave(root, 1);
			const answer = octave(chords[bar][variation], -1);
			return [
				`${root}@3 ~ ${root} ${upper}@2 ~`,
				`${root}@2 ~ ${upper} ${root}@2 ${answer} ~`,
				`${root}@3 ${answer} ~ ${root}@2 ~`
			][variation];
		})
	);
	const hook = phrase([
		'~',
		'~',
		'~',
		'~',
		...chords.map((notes, bar) => {
			const high = notes[3];
			const low = notes[variation];
			return bar % 2 === 0 ? `${high}@3 ${low}@2 ~@3` : `${low}@5 ~@3`;
		})
	]);
	const tone = [
		".s('sine').fm(1.1).fmh(1).fmdecay(.25).lpf(3800)",
		".s('sawtooth').lpf(2400).phaser(.35)",
		".s('triangle').lpf(3200).phaser(.2)"
	][variation];
	return {
		title,
		harmony,
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.93)",
			hats: [
				"stack(s('[~ oh]*4').gain(.32), s('hh*8').gain('.19 .12')).bank('RolandTR909')",
				"stack(s('[~ oh]*4').gain(.3), s('sh*16').gain('.12 .07')).bank('RolandTR808')",
				"stack(s('[~ oh]*4').gain(.28), s('hh*16').gain('.17 .07 .12 .07')).bank('RolandTR707')"
			][variation],
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.43).room(.12)",
			bass: `note('${bass}').s('${variation === 1 ? 'sawtooth' : 'square'}').lpf(950).attack(.008).decay(.18).sustain(.38).release(.06).legato(.85).gain(.4)`,
			synth: `note('${keyboard}')${tone}.attack(.012).decay(.3).sustain(.55).release(.12).legato(.92).room(.16).gain(.13)`,
			vox: `note('${hook}').s('sawtooth').vowel('<o a e o>').hpf(180).lpf(3800).attack(.025).decay(.15).sustain(.7).release(.12).legato(.94).vib(4.5).vibmod(.05).room(.13).gain(.24)`
		}
	};
}

export const FRENCH: Seed[] = (Object.keys(FRENCH_HARMONIES) as HarmonyId[]).flatMap(
	(harmony, index) => [0, 1, 2].map((v) => makeSeed(harmony, v, TITLES[index * 3 + v]))
);
