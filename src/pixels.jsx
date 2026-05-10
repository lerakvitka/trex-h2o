// Pixel art sprite system + sprite definitions

export const PIXEL_PALETTE = {
  '.': null,
  // T-Rex
  D: '#234d23',
  G: '#4d9b4d',
  g: '#74c46d',
  L: '#c8e4b0',
  l: '#a3cf86',
  W: '#fffaf0',
  K: '#1a1a1a',
  M: '#4a2222',
  t: '#fff7c8',
  n: '#3a7a3a',
  // Cup / water
  c: '#fbf6e8',
  C: '#c5b88f',
  b: '#6cc4e8',
  B: '#3d8fb8',
  // Sun
  y: '#ffd34a',
  Y: '#ffe27a',
  o: '#f0a830',
  // Cloud
  w: '#fff8ec',
  e: '#e6dcc4',
  // House
  h: '#b87a4a',
  H: '#7d4d2a',
  r: '#d65c5c',
  R: '#963b3b',
  q: '#f0e0c0',
  // Hills
  p: '#5fa345',
  P: '#3f7a2c',
  // Hat colors
  1: '#ffcc33', 2: '#e89923', 3: '#ff5577', 4: '#a23a5e',
  5: '#7a5fff', 6: '#3a2d80', 7: '#1a1a1a', 8: '#3a3a3a',
  9: '#ff9eb8', 0: '#ffffff', '!': '#5cc1f5', '@': '#2d7eb8',
  '#': '#8e6a3a', $: '#5a3e1d',
  // Flower
  f: '#ff8aa8', F: '#c25272', z: '#ffe27a',
};

export function PixelSprite({ pixels, palette = PIXEL_PALETTE, scale = 5, className = '', style = {}, onClick }) {
  const rows = pixels.length;
  const cols = Math.max(...pixels.map((r) => r.length));
  const rects = [];
  for (let y = 0; y < rows; y++) {
    const row = pixels[y];
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      const color = palette[c];
      if (!color) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < row.length && row[x + len] === c) len++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={len} height={1} fill={color} />);
      x += len;
    }
  }
  return (
    <svg
      width={cols * scale}
      height={rows * scale}
      viewBox={`0 0 ${cols} ${rows}`}
      className={`pixel ${className}`}
      style={{ display: 'block', ...style }}
      onClick={onClick}
    >
      {rects}
    </svg>
  );
}

// =============== T-REX ===============
const TREX_PIXELS = [
  '..............DDDDDDD.....',
  '.............DGGGGGGGD....',
  '............DGgGGGGGGGD...',
  '............DGGWWGGGGGD...',
  '............DGGWKGGGGGD...',
  '............DGGGGGGGGGD...',
  '...........DDGGGGGGGGGDD..',
  '...........DGGGGGGGGGGGD..',
  '...........DGGGGtGGGGGD...',
  '...D......DDGGGGGGGGGD....',
  '..DGD....DDGGGGGGGGGGD....',
  '.DGgGD..DGGGGGGGGGgggDD...',
  'DGgGGGDDGGGGGGGGGGgggLD...',
  'DGGGGGGGGGGGGGGGGgglLLD...',
  'DGGGGGGGGGGGGGGGgglLLLD...',
  '.DGGGGGGGGGGGGGGgLLLLD....',
  '..DGGGGGGGGGGGGGgLLLD.....',
  '...DGGGGGGGGGGGGgLD.......',
  '....DGGGGDDDGGGGD.........',
  '....DGGGD..DGGGGD.........',
  '....DGGGD..DGGGGD.........',
  '....DDDDD..DDDDDD.........',
];

const HAT_PARTY = [
  '.....1.....',
  '....111....',
  '...11111...',
  '..1111111..',
  '.111111111.',
  '11111111111',
  '33333333333',
];

const HAT_CROWN = [
  '1.1.1.1.1.1',
  '1.1.1.1.1.1',
  '11111111111',
  '13311311331',
  '11111111111',
  '22222222222',
];

const HAT_TOP = [
  '.77777777.',
  '.77777777.',
  '.77777777.',
  '.77777777.',
  '.77777777.',
  '.77777777.',
  '9999999999',
  '7777777777',
];

const HAT_FLOWER = [
  '...f.f...f.f...',
  '..fzfzf.fzfzf..',
  '...f.f...f.f...',
  '.f...........f.',
  'fzf.........fzf',
  '.f...........f.',
];

const HAT_WIZARD = [
  '....55....',
  '...5555...',
  '..550055..',
  '..555555..',
  '.55505555.',
  '.55555555.',
  '5555555555',
  '5555555555',
  '6666666666',
];

export const HATS = [
  { id: 'none', name: 'No Hat', pixels: null, unlock: 0, scale: 5, dy: 0 },
  { id: 'party', name: 'Party Hat', pixels: HAT_PARTY, unlock: 0, scale: 5, dy: -22 },
  { id: 'crown', name: 'Crown', pixels: HAT_CROWN, unlock: 5, scale: 5, dy: -16 },
  { id: 'top', name: 'Top Hat', pixels: HAT_TOP, unlock: 10, scale: 5, dy: -28 },
  { id: 'flower', name: 'Flower Crown', pixels: HAT_FLOWER, unlock: 20, scale: 4, dy: -10 },
  { id: 'wizard', name: 'Wizard Hat', pixels: HAT_WIZARD, unlock: 40, scale: 5, dy: -34 },
];

export function TRex({ scale = 5, hatId = 'none', lookDir = 0, lookV = 0 }) {
  const hat = HATS.find((h) => h.id === hatId) || HATS[0];
  return (
    <div className="trex-body" style={{ position: 'relative', width: 26 * scale, height: 22 * scale }}>
      <PixelSprite pixels={TREX_PIXELS} scale={scale} />
      <div
        style={{
          position: 'absolute',
          left: 15 * scale + lookDir * scale * 0.6,
          top: 4 * scale + lookV * scale * 0.6,
          width: scale,
          height: scale,
          background: '#1a1a1a',
          imageRendering: 'pixelated',
          transition: 'left 0.5s cubic-bezier(.4,0,.2,1), top 0.5s cubic-bezier(.4,0,.2,1)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 14 * scale,
          top: 6 * scale,
          width: 2 * scale,
          height: scale,
          background: 'rgba(255, 138, 168, 0.55)',
          borderRadius: '40%',
          pointerEvents: 'none',
        }}
      />
      {hat.pixels && (
        <div
          className="hat"
          style={{
            top: hat.dy + 'px',
            left: '62%',
            transform: 'translateX(-50%)',
          }}
        >
          <PixelSprite pixels={hat.pixels} scale={hat.scale} />
        </div>
      )}
    </div>
  );
}

// =============== CUP ===============
const CUP_PIXELS = [
  'CCCCCCCC',
  'CcccccccC',
  'CcBBBBBcC',
  'CcbbbbbcC',
  'CcbbbbbcC',
  'CccccccC.',
  '.CCCCCCC.',
  '..CCCCCC..',
];

export function Cup({ scale = 4 }) {
  return <PixelSprite pixels={CUP_PIXELS} scale={scale} />;
}

const GLASS_FULL = [
  'BBBBBB',
  'bbbbbb',
  'bbbbbb',
  'bbbbbb',
  'bbbbbb',
  '.bbbb.',
];
const GLASS_EMPTY = [
  'CC..CC',
  'C....C',
  'C....C',
  'C....C',
  'C....C',
  '.CCCC.',
];

export function GlassIcon({ full, scale = 4 }) {
  return <PixelSprite pixels={full ? GLASS_FULL : GLASS_EMPTY} scale={scale} />;
}

// =============== SUN ===============
const SUN_PIXELS = [
  '...yyyyy...',
  '..yyyYYyy..',
  '.yyYYYYYyy.',
  'yyYYYYYYYyy',
  'yyYYYYYYYyy',
  'yyYYYYYYYyy',
  '.yyYYYYYyy.',
  '..yyyYYyy..',
  '...yyyyy...',
];

export function Sun({ scale = 5 }) {
  return <PixelSprite pixels={SUN_PIXELS} scale={scale} />;
}

// =============== CLOUD ===============
const CLOUD_PIXELS = [
  '..eee...eee..',
  '.ewwwe.ewwwe.',
  'ewwwwwwwwwwwe',
  'ewwwwwwwwwwwe',
  '.ewwwwwwwwwe.',
  '..eeeeeeee...',
];

export function Cloud({ scale = 4 }) {
  return <PixelSprite pixels={CLOUD_PIXELS} scale={scale} />;
}

// =============== HOUSE ===============
const HOUSE_PIXELS = [
  '....RR....',
  '...rRRr...',
  '..rrRRrr..',
  '.rrrrrrrr.',
  'rrrrrrrrrr',
  'RRRRRRRRRR',
  'HhhhhhhhhH',
  'Hh!@@!hhhH',
  'Hh!@@!hhhH',
  'Hh!!!!hhhH',
  'Hhhhhh##hH',
  'Hhhhhh#$hH',
  'HHHHHHHHHH',
];

export function House({ scale = 3 }) {
  return <PixelSprite pixels={HOUSE_PIXELS} scale={scale} />;
}

// =============== HILL ===============
const HILL_PIXELS = [
  '....pppppp....',
  '..pppppppppp..',
  '.pppppppppppp.',
  'pppPPPpppPPPpp',
  'pppPPPpppPPPpp',
  'PPPPPPPPPPPPPP',
];

export function Hill({ scale = 4 }) {
  return <PixelSprite pixels={HILL_PIXELS} scale={scale} />;
}

// =============== FLOWER ===============
const FLOWER_PIXELS = [
  '.f.f.',
  'fzfzf',
  '.f.f.',
  '..p..',
  '..p..',
  '..p..',
];

export function Flower({ scale = 3 }) {
  return <PixelSprite pixels={FLOWER_PIXELS} scale={scale} />;
}

// =============== STAR ===============
const SPARKLE_PIXELS = [
  '..0..',
  '.000.',
  '00100',
  '.000.',
  '..0..',
];

export function Sparkle({ scale = 3 }) {
  return <PixelSprite pixels={SPARKLE_PIXELS} scale={scale} />;
}
