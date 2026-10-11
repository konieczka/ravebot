/**
 * Russian shouts for hardbass, played as `s('rus:0')` (давай) ... `s('rus:11')`. Generated once
 * with Shabda (Google text-to-speech, ru-RU male voice) and served from
 * static/samples/rus/NN-name.wav, so nothing depends on the TTS service at runtime. Processed
 * with ffmpeg for a deeper, clearer shout: leading silence trimmed, pitched down 3 semitones at
 * the same length (asetrate + atempo, 44.1 kHz), high-pass 90 Hz, -3 dB at 300 Hz, +4 dB at
 * 3 kHz, compressed (-20 dB, 4:1) and normalised to a 0.9 peak.
 */
export const RUS_VOICE = [
	{ name: 'davai', word: 'давай', meaning: "come on / let's go" },
	{ name: 'hey', word: 'хей', meaning: 'hey' },
	{ name: 'raz', word: 'раз', meaning: 'one' },
	{ name: 'dva', word: 'два', meaning: 'two' },
	{ name: 'tri', word: 'три', meaning: 'three' },
	{ name: 'bochka', word: 'бочка', meaning: 'the kick (lit. barrel)' },
	{ name: 'bass', word: 'бас', meaning: 'bass' },
	{ name: 'kolbasyor', word: 'колбасёр', meaning: 'raver' },
	{ name: 'pognali', word: 'погнали', meaning: "let's go" },
	{ name: 'gromche', word: 'громче', meaning: 'louder' },
	{ name: 'vsevmeste', word: 'все вместе', meaning: 'all together' },
	{ name: 'tantsuy', word: 'танцуй', meaning: 'dance' }
] as const;

export const RUS_BASE = '/samples/rus/';
export const RUS_FILES = RUS_VOICE.map((v, i) => `${String(i).padStart(2, '0')}-${v.name}.wav`);
