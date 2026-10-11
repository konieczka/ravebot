/** A 3×5 bitmap font for signs and graffiti in the club scene. Each glyph is 15 bits, row by row. */
const GLYPHS: Record<string, string> = {
	A: '010101111101101',
	B: '110101110101110',
	C: '011100100100011',
	D: '110101101101110',
	E: '111100110100111',
	F: '111100110100100',
	G: '011100101101011',
	H: '101101111101101',
	I: '111010010010111',
	J: '001001001101010',
	K: '101101110101101',
	L: '100100100100111',
	M: '101111111101101',
	N: '110101101101101',
	O: '010101101101010',
	P: '110101110100100',
	Q: '010101101110011',
	R: '110101110101101',
	S: '011100010001110',
	T: '111010010010010',
	U: '101101101101111',
	V: '101101101101010',
	W: '101101111111101',
	X: '101101010101101',
	Y: '101101010010010',
	Z: '111001010100111',
	'0': '111101101101111',
	'1': '010110010010111',
	'2': '110001010100111',
	'3': '110001010001110',
	'4': '101101111001001',
	'5': '111100110001110',
	'6': '011100111101111',
	'7': '111001010010010',
	'8': '111101111101111',
	'9': '111101111001110',
	'!': '010010010000010',
	'.': '000000000000010',
	'-': '000000111000000',
	' ': '000000000000000'
};

export const textWidth = (s: string, k = 1) => s.length * 4 * k - k;

export function text(
	g: CanvasRenderingContext2D,
	s: string,
	x: number,
	y: number,
	color: string,
	k = 1
) {
	g.fillStyle = color;
	s = s.toUpperCase();
	for (let i = 0; i < s.length; i++) {
		const glyph = GLYPHS[s[i]] ?? GLYPHS[' '];
		for (let b = 0; b < 15; b++)
			if (glyph[b] === '1')
				g.fillRect(
					Math.round(x + i * 4 * k + (b % 3) * k),
					Math.round(y + Math.floor(b / 3) * k),
					k,
					k
				);
	}
}

/** Text centred on `cx`. */
export const textC = (
	g: CanvasRenderingContext2D,
	s: string,
	cx: number,
	y: number,
	color: string,
	k = 1
) => text(g, s, cx - textWidth(s, k) / 2, y, color, k);
