export const LAYERS = ['kick', 'hats', 'perc', 'bass', 'synth', 'vox'] as const;
export type LayerName = (typeof LAYERS)[number];
export type Layers = Record<LayerName, string>;

export type GenreId =
	'minimal' | 'acid' | 'hard' | 'dub' | 'detroit' | 'hypnotic' | 'french' | 'psy' | 'hardbass';

export interface Track {
	id: string;
	title: string;
	/** Short shout-out the robot says when the track drops. */
	comment: string;
	genre: GenreId;
	layers: Layers;
	/** Where the track came from: the LLM or the built-in fallback remixer. */
	source: 'llm' | 'fallback';
	/** Short warnings shown on the track's queue card, e.g. a layer the validator had to patch. */
	flags?: string[];
}

export interface GenerateRequest {
	genre: GenreId;
	bpm: number;
	/** 1..10 */
	energy: number;
	/** 0..10 */
	weirdness: number;
	previous?: Pick<Track, 'title' | 'layers'>;
}

export type GenerateResponse =
	| {
			ok: true;
			track: Omit<Track, 'id' | 'source' | 'genre'>;
			repaired: LayerName[];
			/** LLM calls it took to get a valid, original track. */
			attempts: number;
	  }
	| { ok: false; error: string; offline?: boolean };
