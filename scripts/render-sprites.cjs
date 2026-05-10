const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const OUT = path.resolve(__dirname, '..', 'media', 'case-study');

// Palette mirrors src/pixels.jsx PIXEL_PALETTE; some entries are unused here but kept for parity.
const PALETTE = {
  '.': null,
  D: '#234d23', G: '#4d9b4d', g: '#74c46d', L: '#c8e4b0', l: '#a3cf86',
  W: '#fffaf0', K: '#1a1a1a', M: '#4a2222', t: '#fff7c8', n: '#3a7a3a',
  c: '#fbf6e8', C: '#c5b88f', b: '#6cc4e8', B: '#3d8fb8',
  y: '#ffd34a', Y: '#ffe27a', o: '#f0a830',
  w: '#fff8ec', e: '#e6dcc4',
  h: '#b87a4a', H: '#7d4d2a', r: '#d65c5c', R: '#963b3b', q: '#f0e0c0',
  p: '#5fa345', P: '#3f7a2c',
  1: '#ffcc33', 2: '#e89923', 3: '#ff5577', 4: '#a23a5e',
  5: '#7a5fff', 6: '#3a2d80', 7: '#1a1a1a', 8: '#3a3a3a',
  9: '#ff9eb8', 0: '#ffffff', '!': '#5cc1f5', '@': '#2d7eb8',
  '#': '#8e6a3a', $: '#5a3e1d',
  f: '#ff8aa8', F: '#c25272', z: '#ffe27a',
};

const TREX = [
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
  '.....1.....', '....111....', '...11111...', '..1111111..',
  '.111111111.', '11111111111', '33333333333',
];
const HAT_CROWN = [
  '1.1.1.1.1.1', '1.1.1.1.1.1', '11111111111', '13311311331',
  '11111111111', '22222222222',
];
const HAT_TOP = [
  '.77777777.', '.77777777.', '.77777777.', '.77777777.',
  '.77777777.', '.77777777.', '9999999999', '7777777777',
];
const HAT_FLOWER = [
  '...f.f...f.f...', '..fzfzf.fzfzf..', '...f.f...f.f...',
  '.f...........f.', 'fzf.........fzf', '.f...........f.',
];
const HAT_WIZARD = [
  '....55....', '...5555...', '..550055..', '..555555..',
  '.55505555.', '.55555555.', '5555555555', '5555555555', '6666666666',
];

const HATS = {
  party:  { pixels: HAT_PARTY,  scale: 5, dy: -22 },
  crown:  { pixels: HAT_CROWN,  scale: 5, dy: -16 },
  top:    { pixels: HAT_TOP,    scale: 5, dy: -28 },
  flower: { pixels: HAT_FLOWER, scale: 4, dy: -10 },
  wizard: { pixels: HAT_WIZARD, scale: 5, dy: -34 },
};

const SUN = [
  '...yyyyy...', '..yyyYYyy..', '.yyYYYYYyy.', 'yyYYYYYYYyy',
  'yyYYYYYYYyy', 'yyYYYYYYYyy', '.yyYYYYYyy.', '..yyyYYyy..',
  '...yyyyy...',
];
const CLOUD = [
  '..eee...eee..', '.ewwwe.ewwwe.', 'ewwwwwwwwwwwe', 'ewwwwwwwwwwwe',
  '.ewwwwwwwwwe.', '..eeeeeeee...',
];
const HOUSE = [
  '....RR....', '...rRRr...', '..rrRRrr..', '.rrrrrrrr.',
  'rrrrrrrrrr', 'RRRRRRRRRR', 'HhhhhhhhhH', 'Hh!@@!hhhH',
  'Hh!@@!hhhH', 'Hh!!!!hhhH', 'Hhhhhh##hH', 'Hhhhhh#$hH',
  'HHHHHHHHHH',
];
const HILL = [
  '....pppppp....', '..pppppppppp..', '.pppppppppppp.',
  'pppPPPpppPPPpp', 'pppPPPpppPPPpp', 'PPPPPPPPPPPPPP',
];
const FLOWER = [
  '.f.f.', 'fzfzf', '.f.f.', '..p..', '..p..', '..p..',
];

function spriteRects(pixels) {
  const rects = [];
  for (let y = 0; y < pixels.length; y++) {
    const row = pixels[y];
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      const color = PALETTE[c];
      if (!color) { x++; continue; }
      let len = 1;
      while (x + len < row.length && row[x + len] === c) len++;
      rects.push(`<rect x="${x}" y="${y}" width="${len}" height="1" fill="${color}"/>`);
      x += len;
    }
  }
  return rects.join('');
}

function dimsOf(pixels) {
  return { rows: pixels.length, cols: Math.max(...pixels.map((r) => r.length)) };
}

function svgFor(pixels, scale, opts = {}) {
  const { rows, cols } = dimsOf(pixels);
  const w = cols * scale;
  const h = rows * scale;
  const inner = spriteRects(pixels);
  const bg = opts.bg ? `<rect width="${cols}" height="${rows}" fill="${opts.bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${cols} ${rows}" shape-rendering="crispEdges">${bg}${inner}</svg>`;
}

function renderSvg(svg, outFile) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'original' } });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, outFile), png);
  console.log('  wrote', outFile, `(${png.length} bytes)`);
}

function trexWithHat({ hat, pupilDx = 0, pupilDy = 0, scale = 6 }) {
  const { rows: tr, cols: tc } = dimsOf(TREX);
  const w = tc * scale;
  const h = tr * scale;

  const eyeX = 15 * scale + pupilDx * scale * 0.6;
  const eyeY = 4 * scale + pupilDy * scale * 0.6;
  const pupilOverlay = `<rect x="${eyeX}" y="${eyeY}" width="${scale}" height="${scale}" fill="#1a1a1a"/>`;
  const blushOverlay = `<rect x="${14 * scale}" y="${6 * scale}" width="${2 * scale}" height="${scale}" fill="rgba(255,138,168,0.55)" rx="${scale * 0.4}"/>`;

  let hatLayer = '';
  let hatExtraTop = 0;
  if (hat) {
    const { pixels, scale: hatScale, dy } = HATS[hat];
    const { rows: hr, cols: hc } = dimsOf(pixels);
    const hatW = hc * hatScale;
    const hatH = hr * hatScale;
    const hatX = w * 0.62 - hatW / 2;
    const hatY = dy;
    hatExtraTop = Math.max(0, -hatY);
    hatLayer = `<svg x="${hatX}" y="${hatY}" width="${hatW}" height="${hatH}" viewBox="0 0 ${hc} ${hr}" shape-rendering="crispEdges">${spriteRects(pixels)}</svg>`;
  }

  const totalH = h + hatExtraTop;
  const yOffset = hatExtraTop;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}" shape-rendering="crispEdges">
    <g transform="translate(0,${yOffset})">
      <svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 ${tc} ${tr}" shape-rendering="crispEdges">${spriteRects(TREX)}</svg>
      ${pupilOverlay}
      ${blushOverlay}
      ${hatLayer}
    </g>
  </svg>`;
}

function trexStatesStrip() {
  const offsets = [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }];
  const scale = 6;
  const { rows: tr, cols: tc } = dimsOf(TREX);
  const tileW = tc * scale + 12;
  const tileH = tr * scale;
  const w = tileW * 3;
  const tiles = offsets
    .map((o, i) => `<g transform="translate(${i * tileW},0)">${trexWithHat({ hat: null, pupilDx: o.x, pupilDy: o.y, scale })}</g>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${tileH}" viewBox="0 0 ${w} ${tileH}" shape-rendering="crispEdges">${tiles}</svg>`;
}

function sceneComposite() {
  const SCENE_W = 480;
  const SCENE_H = 340;
  const OUT_SCALE = 2;
  const w = SCENE_W * OUT_SCALE;
  const h = SCENE_H * OUT_SCALE;

  const sky = `<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%" stop-color="#ffe7c8"/>
    <stop offset="55%" stop-color="#ffcfa3"/>
    <stop offset="78%" stop-color="#f7b890"/>
    <stop offset="100%" stop-color="#f7b890"/>
  </linearGradient>
  <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%" stop-color="#8ccc63"/>
    <stop offset="35%" stop-color="#6cb04a"/>
    <stop offset="100%" stop-color="#4f9036"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>`;

  const groundH = 90 * OUT_SCALE;
  const ground = `<rect x="0" y="${h - groundH}" width="${w}" height="${groundH}" fill="url(#grass)"/>
    <rect x="0" y="${h - groundH - 3 * OUT_SCALE}" width="${w}" height="${3 * OUT_SCALE}" fill="#234d23"/>`;

  function place(svgInner, x, y, srcW, srcH, pixW, pixH) {
    return `<svg x="${x}" y="${y}" width="${srcW}" height="${srcH}" viewBox="0 0 ${pixW} ${pixH}">${svgInner}</svg>`;
  }

  const sunDims = dimsOf(SUN);
  const sun = place(spriteRects(SUN), 32 * OUT_SCALE, 22 * OUT_SCALE, sunDims.cols * 4 * OUT_SCALE, sunDims.rows * 4 * OUT_SCALE, sunDims.cols, sunDims.rows);

  const cloudDims = dimsOf(CLOUD);
  const cloud1 = place(spriteRects(CLOUD), 60 * OUT_SCALE, 28 * OUT_SCALE, cloudDims.cols * 4 * OUT_SCALE, cloudDims.rows * 4 * OUT_SCALE, cloudDims.cols, cloudDims.rows);
  const cloud2 = place(spriteRects(CLOUD), 250 * OUT_SCALE, 56 * OUT_SCALE, cloudDims.cols * 3 * OUT_SCALE, cloudDims.rows * 3 * OUT_SCALE, cloudDims.cols, cloudDims.rows);
  const cloud3 = place(spriteRects(CLOUD), 360 * OUT_SCALE, 14 * OUT_SCALE, cloudDims.cols * 3 * OUT_SCALE, cloudDims.rows * 3 * OUT_SCALE, cloudDims.cols, cloudDims.rows);

  const hillDims = dimsOf(HILL);
  const hillBackY = h - groundH - hillDims.rows * 6 * OUT_SCALE + 12 * OUT_SCALE;
  const hill1 = `<g opacity="0.7">${place(spriteRects(HILL), 80 * OUT_SCALE, hillBackY, hillDims.cols * 4.8 * OUT_SCALE, hillDims.rows * 4.8 * OUT_SCALE, hillDims.cols, hillDims.rows)}</g>`;
  const hill2 = `<g opacity="0.85">${place(spriteRects(HILL), 250 * OUT_SCALE, hillBackY + 8 * OUT_SCALE, hillDims.cols * 6 * OUT_SCALE, hillDims.rows * 6 * OUT_SCALE, hillDims.cols, hillDims.rows)}</g>`;

  const houseDims = dimsOf(HOUSE);
  const house = place(spriteRects(HOUSE), (480 - 36 - houseDims.cols * 3) * OUT_SCALE, (340 - 76 - houseDims.rows * 3) * OUT_SCALE, houseDims.cols * 3 * OUT_SCALE, houseDims.rows * 3 * OUT_SCALE, houseDims.cols, houseDims.rows);

  const trexDims = dimsOf(TREX);
  const trexX = (SCENE_W - trexDims.cols * 5) / 2 * OUT_SCALE;
  const trexY = (SCENE_H - 50 - trexDims.rows * 5) * OUT_SCALE;
  const trex = `<g transform="translate(${trexX},${trexY})">${trexWithHat({ hat: null, scale: 5 * OUT_SCALE })}</g>`;

  const flowerDims = dimsOf(FLOWER);
  const flower1 = place(spriteRects(FLOWER), 36 * OUT_SCALE, (340 - 18 - flowerDims.rows * 3) * OUT_SCALE, flowerDims.cols * 3 * OUT_SCALE, flowerDims.rows * 3 * OUT_SCALE, flowerDims.cols, flowerDims.rows);
  const flower2 = place(spriteRects(FLOWER), 88 * OUT_SCALE, (340 - 10 - flowerDims.rows * 2) * OUT_SCALE, flowerDims.cols * 2 * OUT_SCALE, flowerDims.rows * 2 * OUT_SCALE, flowerDims.cols, flowerDims.rows);
  const flower3 = place(spriteRects(FLOWER), (480 - 120 - flowerDims.cols * 3) * OUT_SCALE, (340 - 14 - flowerDims.rows * 3) * OUT_SCALE, flowerDims.cols * 3 * OUT_SCALE, flowerDims.rows * 3 * OUT_SCALE, flowerDims.cols, flowerDims.rows);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
    ${sky}
    ${sun}${cloud1}${cloud2}${cloud3}
    ${hill1}${hill2}
    ${ground}
    ${house}${flower1}${flower2}${flower3}
    ${trex}
  </svg>`;
}

(function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  console.log('Rendering to', OUT);

  // Bare T-Rex (hero)
  renderSvg(trexWithHat({ hat: null, scale: 12 }), 'trex-hero.png');

  // Three-up look-direction strip
  renderSvg(trexStatesStrip(), 'trex-states.png');

  // Scene props
  renderSvg(svgFor(SUN, 8), 'sun.png');
  renderSvg(svgFor(CLOUD, 8), 'cloud.png');
  renderSvg(svgFor(HILL, 8), 'hill.png');
  renderSvg(svgFor(HOUSE, 8), 'house.png');
  renderSvg(svgFor(FLOWER, 8), 'flower.png');

  // Scene composite
  renderSvg(sceneComposite(), 'scene-composite.png');

  // Hats (on T-Rex). hat-none.png is a duplicate of trex-hero.png at scale 6 to keep grid clean.
  renderSvg(trexWithHat({ hat: null, scale: 6 }), 'hat-none.png');
  renderSvg(trexWithHat({ hat: 'party', scale: 6 }), 'hat-party.png');
  renderSvg(trexWithHat({ hat: 'crown', scale: 6 }), 'hat-crown.png');
  renderSvg(trexWithHat({ hat: 'top', scale: 6 }), 'hat-top.png');
  renderSvg(trexWithHat({ hat: 'flower', scale: 6 }), 'hat-flower.png');
  renderSvg(trexWithHat({ hat: 'wizard', scale: 6 }), 'hat-wizard.png');

  console.log('Done. 14 PNGs in', OUT);
})();
