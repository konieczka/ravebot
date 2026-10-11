import type { GenreId } from './types';

export interface CrateName {
	title: string;
	/** The robot's shout when the track drops (max 12 words, like the LLM's). */
	comment: string;
}

/**
 * Names for the crate remixes (see fallback.ts), written per genre so a remix sounds like it
 * belongs to its scene. Titles and comments are unique across genres, and titles never clash
 * with the seed titles (checked in seeds.spec.ts).
 */
export const CRATE_NAMES: Record<GenreId, CrateName[]> = {
	minimal: [
		{ title: 'Less Is Morgen', comment: 'Fewer notes, more morning. Nobody is going home.' },
		{ title: 'Click Here to Leave', comment: 'The exit is clickable. Nobody is clicking it.' },
		{ title: 'Plattenbau Pulse', comment: 'Built from grey concrete and one stubborn kick.' },
		{ title: 'Späti at Six AM', comment: 'Corner shop run, then straight back to the floor.' },
		{ title: 'One Rim Shot Wonder', comment: 'One rim shot. That is the whole melody.' },
		{
			title: 'Negative Space Invaders',
			comment: 'Mind the gaps, they are doing the heavy lifting.'
		},
		{ title: 'Turnstile Tuesday', comment: 'It is Tuesday. The bouncer let us in anyway.' },
		{ title: 'Mate Bottle Monologue', comment: 'Fuelled by caffeine and suspiciously long loops.' },
		{ title: 'Microhouse Arrest', comment: 'You are under arrest. The groove is your cell.' },
		{ title: 'Hold the Hi-Hat', comment: 'Hats held back. Patience is a genre here.' },
		{ title: 'Fernsehturm Flicker', comment: 'Tower lights blinking along in perfect sixteenths.' },
		{ title: 'Grey Hoodie Theory', comment: 'Dress code: grey. Dance code: barely moving.' },
		{ title: 'Two Notes Too Many', comment: 'I cut two notes. Still feels a bit busy.' },
		{ title: 'U-Bahn Undertow', comment: 'Last train is gone. Ride this bassline instead.' },
		{ title: 'Quiet Please, Clicking', comment: 'Shh. The clicks are concentrating.' },
		{ title: 'Neukölln Nap Schedule', comment: 'Sleep at noon, dance until the next noon.' },
		{ title: 'Sparse Change', comment: 'Small change, big feelings. Keep the coins.' },
		{ title: 'Tempelhof Takeoff', comment: 'Old airport, new runway. Cleared for slow takeoff.' },
		{
			title: 'Cigarette Break Groove',
			comment: 'Smokers, come back in. You are missing nothing. Perfect.'
		},
		{ title: 'Ninety Percent Silence', comment: 'Ninety percent silence, ten percent pure danger.' }
	],
	acid: [
		{ title: 'Three-Oh-Three Strikes', comment: 'Three strikes and the filter is still open!' },
		{ title: 'Resonant Peel', comment: 'Peeling the paint off the walls, one squelch at a time.' },
		{ title: 'Squelch Mountain', comment: 'Climbing the resonance peak. No oxygen required.' },
		{ title: 'Pocket Full of Acid', comment: 'Silver box in my pocket, chaos in my circuits.' },
		{ title: 'Silver Box Sermon', comment: 'The little silver box will now preach.' },
		{ title: 'Filter Cutoff Day', comment: 'Cutoff knob at noon, rising by the minute.' },
		{ title: 'Bleach Blonde Bassline', comment: 'Bassline dyed acid yellow. No regrets.' },
		{ title: 'Slide and Accent', comment: 'Slide on, accent on, sanity off.' },
		{ title: 'Rubber Ducky Resonance', comment: 'Bath time, but the duck squelches back.' },
		{ title: 'Lemon Squeezer Sequence', comment: 'Fresh squeezed sixteenths, extra sour.' },
		{ title: 'Chicago Chemistry Set', comment: 'Mixing Chicago chemicals. Goggles on, hands up.' },
		{ title: 'Envelope Mod Squad', comment: 'Envelope mod cranked. The squad has arrived.' },
		{ title: 'Neon Gherkin', comment: 'Green, glowing, slightly pickled. Just like me.' },
		{ title: 'Acid Test Pilot', comment: 'Test flight approved. Resonance at maximum altitude.' },
		{ title: 'The Bassline Bites Back', comment: 'You poked the bassline. Now it bites.' },
		{
			title: 'Sour Patch Sequencer',
			comment: 'First it is sour, then it is sweet, then sour again.'
		},
		{ title: 'Litmus Paper Party', comment: 'Dip a finger in. Result: extremely acidic.' },
		{ title: 'pH Below Zero', comment: 'Chemists say impossible. The dance floor says otherwise.' },
		{ title: 'Corrosive Groove Theory', comment: 'This groove eats through the floorboards.' },
		{
			title: 'Smiley Sticker Shock',
			comment: 'Smiley faces everywhere. Keep smiling, keep squelching.'
		}
	],
	hard: [
		{ title: 'Rivet Gun Romance', comment: 'A love story told entirely in rivets.' },
		{
			title: 'Hydraulic Press Release',
			comment: 'Pressure building. Releasing it on your ribcage.'
		},
		{ title: 'Foundry Fever Dream', comment: 'Molten kicks poured straight from the furnace.' },
		{ title: 'Steel Toe Tango', comment: 'Safety boots on. This tango kicks back.' },
		{ title: 'Pneumatic Prayer', comment: 'Air hammers in unison. Amen to the kick.' },
		{ title: 'Scaffolding Collapse', comment: 'The scaffolding gave up. The kick did not.' },
		{
			title: 'Overtime at the Smelter',
			comment: 'Double shift at the smelter. Pay is in decibels.'
		},
		{
			title: 'Kick Drum Court Martial',
			comment: 'The kick is on trial. Verdict: guilty of banging.'
		},
		{ title: 'Hazard Tape Halo', comment: 'Do not cross the line. Cross it anyway.' },
		{ title: 'Iron Lung Workout', comment: 'Breathe in steel, breathe out distortion.' },
		{
			title: 'Pedal to the Metal Detector',
			comment: 'Every scanner in the building is beeping along.'
		},
		{ title: 'Concrete Mixer Waltz', comment: 'One two three, one two three, all of it concrete.' },
		{ title: 'Shipping Container Siege', comment: 'Forty feet of steel box. Every wall rattling.' },
		{ title: 'Warehouse Fire Drill', comment: 'This is not a drill. Okay, it is a drill.' },
		{ title: 'Bolt Cutter Requiem', comment: 'Cutting the chains. Laying the quiet bits to rest.' },
		{ title: 'Clipping Is a Feature', comment: 'Red lights on every meter. Working as intended.' },
		{ title: 'Earplug Economics', comment: 'Earplugs are now the most valuable currency here.' },
		{ title: 'Jackhammer Jurisprudence', comment: 'The law says faster. The jackhammer agrees.' },
		{
			title: 'Strobe Light Interrogation',
			comment: 'Lights in your eyes. Confess your love for kicks.'
		},
		{ title: 'Foghorn Fight Club', comment: 'First rule of foghorn club: everyone hears it.' }
	],
	dub: [
		{ title: 'Chord Fog Advisory', comment: 'Visibility low, chords heavy. Drive slowly.' },
		{ title: 'Delay Line Fishing', comment: 'Casting one chord, catching seven echoes.' },
		{ title: 'Reverb Rent Control', comment: 'This room is huge and the echoes pay no rent.' },
		{ title: 'Dub Siren Siesta', comment: 'Siren on low, eyes half closed, hips swaying.' },
		{ title: 'Spring Tank Séance', comment: 'Tapping the spring reverb. Something echoes back.' },
		{
			title: 'Harbour Mist Hymn',
			comment: 'Foghorns in the distance, bass right under your feet.'
		},
		{ title: 'Tape Echo Pilgrimage', comment: 'Every echo walks a little further away.' },
		{ title: 'Underwater Commute', comment: 'Morning commute, but the train is a submarine.' },
		{ title: 'Rainy Platform Nine', comment: 'Train delayed. Bassline not delayed. Mostly.' },
		{ title: 'Feedback Loop Café', comment: 'One coffee, endlessly refilled by the delay.' },
		{ title: 'Kettle on the Echo', comment: 'Put the kettle on. It will echo for an hour.' },
		{ title: 'Slow Motion Shipwreck', comment: 'Sinking slowly, enjoying every bubble.' },
		{ title: 'Static on the Shoreline', comment: 'Waves of hiss, tide of sub bass.' },
		{ title: 'Damp Cellar Chords', comment: 'Recorded in a cellar. You can hear the mould.' },
		{ title: 'Barometer Falling', comment: 'Pressure dropping. Low end rising.' },
		{ title: 'Moss Covered Monitor', comment: 'Speakers so old they grew moss. Still thumping.' },
		{ title: 'Drizzle Dispatch', comment: 'Forecast: light drizzle of delayed chords.' },
		{ title: 'Half Past Hazy', comment: 'What time is it? Half past hazy.' },
		{ title: 'Sonar Sunday', comment: 'Ping. Ping. Bass detected below the hull.' },
		{ title: 'Ghost Ship Guestlist', comment: 'Plus one for every ghost on deck.' }
	],
	detroit: [
		{ title: 'Woodward Avenue Warp', comment: 'Cruising Woodward at warp speed, strings up.' },
		{ title: 'Eight Mile Synthesis', comment: 'Eight miles of synth pads, no traffic.' },
		{
			title: 'Robot Shift Supervisor',
			comment: 'I supervise the robots. The robots supervise the groove.'
		},
		{ title: 'Chrome Hubcap Halo', comment: 'Polished chrome, golden pads, eyes on the sky.' },
		{ title: 'Soul Circuit Board', comment: 'Soldered with soul. Every trace carries a feeling.' },
		{ title: 'Strings for the Machines', comment: 'Machines need love songs too. Here is one.' },
		{ title: 'Grand River Groove', comment: 'Riding the river all the way to the future.' },
		{ title: 'Hi-Tech Gospel', comment: 'Can I get a hallelujah from the hi-hats?' },
		{ title: 'Pistons and Pads', comment: 'Engine below, angels above. Detroit in one bar.' },
		{ title: 'Afrofuture Commute', comment: 'Next stop: the future. Please mind the groove.' },
		{ title: 'Factory Floor Romance', comment: 'Fell in love on the assembly line. Again.' },
		{ title: 'Ten Thousand Horsepower Hug', comment: 'A big warm hug with a V8 inside.' },
		{ title: 'Cosmic Paycheck', comment: 'Payday from the cosmos. Spend it on dancing.' },
		{ title: 'Nightshift Nebula', comment: 'Clocked in at midnight, floating by one.' },
		{ title: 'Abandoned Theatre Strings', comment: 'The theatre closed. The strings never left.' },
		{ title: 'Car Radio Constellation', comment: 'Tuned the car radio to a distant star.' },
		{ title: 'Belle Isle Starlight', comment: 'Island lights, river breeze, chords for days.' },
		{ title: 'Union Hall Utopia', comment: 'Workers of the dance floor, unite!' },
		{ title: 'Engine Block Party', comment: 'Everybody bring a carburettor. Party is outside.' },
		{ title: 'Greyhound to Jupiter', comment: 'One way ticket out of orbit. Window seat.' }
	],
	hypnotic: [
		{ title: 'Pendulum Hours', comment: 'Watch the pendulum. You are getting very groovy.' },
		{ title: 'Loop Without Exit', comment: 'There is no exit. There is only the loop.' },
		{ title: 'Trance Reflex', comment: 'Knee jerk reaction: eyes closed, head nodding.' },
		{ title: 'Sixteen Bars of Fog', comment: 'Sixteen bars in, nobody remembers bar one.' },
		{ title: 'Revolving Door Sermon', comment: 'Round and round, the sermon never ends.' },
		{ title: 'Tunnel Vision Tutorial', comment: 'Step one: stare forward. There is no step two.' },
		{ title: 'Counting Sheep in 7/8', comment: 'One sheep is always missing. Keep counting.' },
		{ title: 'Ouroboros Shuffle', comment: 'The snake eats its tail. The tail keeps grooving.' },
		{ title: 'Metronome Monk', comment: 'A vow of silence, broken only by the toms.' },
		{ title: 'Deep Breath Engine', comment: 'Breathe in on the kick, out on the snare.' },
		{ title: 'Eyelids Heavy', comment: 'Eyes closing, feet still going. Ideal state.' },
		{ title: 'Moth to the Strobe', comment: 'Drawn to the light, wings in perfect tempo.' },
		{ title: 'Labyrinth Lounge', comment: 'Lost in the maze. Comfortable seating provided.' },
		{ title: 'Hall of Mirrors Groove', comment: 'Every reflection dancing slightly off the beat.' },
		{ title: 'Recursive Rain', comment: 'Rain falling inside rain inside rain.' },
		{ title: 'Candle Wax Cycle', comment: 'Slowly melting into the same four bars.' },
		{ title: 'Whirlpool Liturgy', comment: 'Spinning inward. Do not fight the current.' },
		{ title: 'The Long Stare', comment: 'Stare at the speaker until it stares back.' },
		{ title: 'Drone Hum Psalm', comment: 'One low hum, held for eternity. Join in.' },
		{ title: 'Clockwork Tide', comment: 'The tide comes in exactly every eight bars.' }
	],
	french: [
		{ title: 'Filtered Baguette', comment: 'Fresh from the oven, warm through a low-pass filter.' },
		{ title: 'Pain au Chorus', comment: 'Flaky, buttery, and drenched in chorus.' },
		{ title: 'Sidechain Sommelier', comment: 'Notes of pumping, with a long, ducking finish.' },
		{
			title: 'Champs-Élysées Compressor',
			comment: 'Squeezing the whole avenue into one fat loop.'
		},
		{ title: 'Vespa Vocoder', comment: 'Scooting through Paris, singing through a robot throat.' },
		{ title: 'Rive Gauche Riff', comment: 'Left bank, left hand on the filter knob.' },
		{ title: 'Discothèque Déjà Vu', comment: 'Have we danced to this before? Who cares!' },
		{ title: 'Filter Me Tender', comment: 'Opening the filter very slowly. Just for you.' },
		{ title: 'Crêpe Suzette Sampler', comment: 'Sampled a dessert. It is on fire now.' },
		{ title: 'Funk au Lait', comment: 'Smooth funk, splash of milk, no sugar needed.' },
		{ title: 'Mirrorball Métro', comment: 'Line one, now stopping at the mirrorball.' },
		{ title: 'Louvre Loop Pyramid', comment: 'A glass pyramid of perfectly stacked loops.' },
		{ title: 'Robot Bistro', comment: 'Table for two robots, extra disco on the side.' },
		{ title: 'Bonjour Bassline', comment: 'Bonjour, bassline. Kiss on each cheek.' },
		{
			title: 'Eiffel Tower Overdrive',
			comment: 'Lights sparkling on the hour. Bass sparkling always.'
		},
		{ title: 'Chic Happens', comment: 'Shrug, smile, keep strutting. Chic happens.' },
		{ title: 'Disco Ennui', comment: 'So bored. So French. So funky anyway.' },
		{ title: 'Pompidou Pump', comment: 'Pipes on the outside, pump on the inside.' },
		{ title: 'Ooh La Lowpass', comment: 'Ooh la la, the filter is opening!' },
		{ title: 'Montmartre Moonwalk', comment: 'Moonwalking up the hill. Very steep. Very smooth.' }
	],
	psy: [
		{ title: 'Goa Constrictor', comment: 'This bassline wraps around you and squeezes.' },
		{ title: 'Didgeridoo Download', comment: 'Downloading ancient wisdom at 145 BPM.' },
		{ title: 'Lotus Position Overdrive', comment: 'Sit cross-legged. Now stand up and stomp.' },
		{ title: 'Fluoro Tapestry', comment: 'Every colour under the blacklight, all at once.' },
		{ title: 'Sunrise Set Upgrade', comment: 'The sun is rising. Installing the morning patch.' },
		{
			title: 'Interdimensional Customs',
			comment: 'Anything to declare? Only good vibes, officer.'
		},
		{ title: 'Neon Mandala Maze', comment: 'Follow the pattern. It follows you back.' },
		{ title: 'Forest Floor Teleport', comment: 'Stepped on a mushroom. Arrived somewhere else.' },
		{ title: 'Gnome Mode', comment: 'Small hat, big bassline. Gnome mode activated.' },
		{ title: 'UV Paint Emergency', comment: 'We are out of UV paint. Glow harder.' },
		{ title: 'Astral Traffic Jam', comment: 'Gridlock on the astral plane. Honk in time.' },
		{ title: 'Hippie Flip Flop', comment: 'Lost a flip flop. Found enlightenment.' },
		{ title: 'Nine Dimensions Deep', comment: 'Dimension nine has an excellent sound system.' },
		{ title: 'Cosmic Bus Driver', comment: 'Fares please. Next stop: the third eye.' },
		{ title: 'Rolling Bassline Pilgrim', comment: 'Rolling, rolling, rolling all the way to Goa.' },
		{ title: 'Day Three Festival Brain', comment: 'Day three. No sleep. Perfect rhythm.' },
		{ title: 'Trippy Toaster', comment: 'My toaster sees colours now. So do I.' },
		{ title: 'Psychedelic Pocket Calculator', comment: 'Two plus two equals the universe.' },
		{ title: 'Sacred Geometry Homework', comment: 'Show your working. Draw it in lasers.' },
		{ title: 'Pixie Dust Bandwidth', comment: 'Upload speed: magic. Download speed: more magic.' }
	],
	hardbass: [
		{ title: 'Shell Suit Shuffle', comment: 'Shell suits rustling in perfect synchronisation.' },
		{ title: 'Gopnik Gold Chain', comment: 'Gold chain on, heels flat, bass heavy.' },
		{ title: 'Pelmeni Pressure', comment: 'Dumplings boiling, kick drum boiling harder.' },
		{ title: 'Lada Turbo Kit', comment: 'Old Lada, new turbo, maximum bass in the trunk.' },
		{ title: 'Khrushchyovka Rooftop', comment: 'Five floors up, the whole block bouncing.' },
		{
			title: 'Mayonnaise Mainframe',
			comment: 'Mayonnaise on everything, including the mainframe.'
		},
		{ title: 'Balcony Bass Cannon', comment: 'Speaker on the balcony. Neighbours joining in.' },
		{ title: 'Babushka Bodyguard', comment: 'Grandma is security tonight. Behave and squat.' },
		{ title: 'Kvass Overdrive', comment: 'Fizzy, sour, and distorted. Pour another.' },
		{ title: 'Semechki Slam', comment: 'Sunflower seeds spat on every downbeat.' },
		{ title: 'Heels Flat Countdown', comment: 'Heels flat on the floor. Three, two, one!' },
		{ title: 'Marshrutka Mosh', comment: 'Minibus packed. Driver also dancing.' },
		{
			title: 'Cheeki Breeki Bounce',
			comment: 'Everyone bounce, nobody stand still, cheeki breeki!'
		},
		{ title: 'Panelka Pump', comment: 'The panel block is pumping. Every window lit.' },
		{ title: 'Garage Kombat Groove', comment: 'Garage door up. Bass in the courtyard.' },
		{ title: 'Dacha Weekend Riot', comment: 'Potatoes planted, bass system unpacked.' },
		{ title: 'Bus Stop Sound System', comment: 'The bus is late. The rave is not.' },
		{ title: 'Kefir Kick Drum', comment: 'Healthy breakfast, unhealthy kick drum.' },
		{ title: 'Borscht Bass Boost', comment: 'Beetroot red bass, served piping hot.' },
		{ title: 'Samovar Stomp', comment: 'Tea is ready. Stomp until it cools.' }
	]
};
