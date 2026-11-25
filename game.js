/* 奶油小铺 · PIXEL CAKE STUDIO
 * 纯 Canvas 像素画 + 原生指针事件，无任何外部依赖。
 */

const W = 480;
const H = 320;
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const els = {
  baseGrid: document.getElementById('baseGrid'),
  creamSwatches: document.getElementById('creamSwatches'),
  brushSizes: document.getElementById('brushSizes'),
  coveragePct: document.getElementById('coveragePct'),
  coverageBar: document.getElementById('coverageBar'),
  coverageHint: document.getElementById('coverageHint'),
  coverageMeter: document.querySelector('.meter'),
  nextBtn: document.getElementById('nextBtn'),
  backBtn: document.getElementById('backBtn'),
  undoBtn: document.getElementById('undoBtn'),
  resetBtn: document.getElementById('resetBtn'),
  noteText: document.getElementById('noteText'),
  stageStatus: document.getElementById('stageStatus'),
  actionHint: document.getElementById('actionHint'),
  selectionRow: document.getElementById('selectionRow'),
  selectionName: document.getElementById('selectionName'),
  deleteSel: document.getElementById('deleteSel'),
  decoGrid: document.getElementById('decoGrid'),
  finishModal: document.getElementById('finishModal'),
  finishImg: document.getElementById('finishImg'),
  finishDate: document.getElementById('finishDate'),
  downloadBtn: document.getElementById('downloadBtn'),
  againBtn: document.getElementById('againBtn'),
  closeFinishBtn: document.getElementById('closeFinishBtn'),
  ghostLayer: document.getElementById('ghostLayer'),
  toast: document.getElementById('toast'),
};

const params = new URLSearchParams(location.search);

/* ------------------------------------------------------------------ */
/* 常量与调色板                                                        */
/* ------------------------------------------------------------------ */

const OUTLINE = '#4a2e26';
const GOAL = 0.55;
const BRUSH_RADII = [4, 7, 11];
const DECO_SCALE = 2;
const DEFAULT_BASE = 'vanilla';

const CAKE = { cx: 240, topY: 150, rx: 88, ry: 30, bodyH: 84, bottomRy: 26 };
CAKE.bottomY = CAKE.topY + CAKE.bodyH;

const BASE = {
  vanilla: {
    name: '香草原味', tag: '经典',
    side: '#E9C98E', light: '#F4DFB4', dark: '#CBA56C',
    top: '#F8E7BE', topRim: '#D9BB86', band: '#FBF0D6', jam: '#D98A6A',
    crumb: '#C9A468', crumb2: '#F8E7BE', seed: 11,
  },
  matcha: {
    name: '抹茶', tag: '清新',
    side: '#B9D48E', light: '#D1E5AE', dark: '#94B26A',
    top: '#D3E6AD', topRim: '#A9C47F', band: '#EEF4D8', jam: '#7FA55A',
    crumb: '#8EA96C', crumb2: '#E4EFC8', seed: 22,
  },
  cocoa: {
    name: '巧克力', tag: '浓郁',
    side: '#8A5A3B', light: '#A97450', dark: '#6B4329',
    top: '#A97450', topRim: '#7A4F31', band: '#E8D2B0', jam: '#5B3420',
    crumb: '#5B3A26', crumb2: '#C08A63', seed: 33,
  },
};

const CREAMS = [
  { name: '香草', base: '#FFF4DC', light: '#FFFEF4', dark: '#EAD6B3' },
  { name: '草莓', base: '#FFC4D2', light: '#FFE8EE', dark: '#EFA2B6' },
  { name: '抹茶', base: '#D8EBBE', light: '#F2F9E3', dark: '#B9D59A' },
  { name: '芋泥', base: '#DCC9EF', light: '#F4EBFD', dark: '#C0A6DC' },
];

const SPARKLES = [
  { x: 38, y: 84, p: 0.2, c: '#F7C948' },
  { x: 436, y: 62, p: 1.7, c: '#F49AB4' },
  { x: 58, y: 252, p: 2.6, c: '#F49AB4' },
  { x: 426, y: 250, p: 0.9, c: '#F7C948' },
  { x: 28, y: 182, p: 3.4, c: '#FFF6E6' },
  { x: 452, y: 182, p: 4.1, c: '#8FB3D9' },
  { x: 116, y: 40, p: 5.3, c: '#F7C948' },
  { x: 372, y: 36, p: 2.2, c: '#FFF6E6' },
];

const DECO_DEFS = [
  {
    id: 'strawberry', name: '草莓',
    palette: { o: '#4A2E26', r: '#E94B63', d: '#C22C42', l: '#FF8FA3', w: '#FFE9B0', g: '#7DAA55', G: '#567F36' },
    rows: [
      '....gg.gg.....',
      '...gGgggGg....',
      '...ggggggg....',
      '..ooooooooo...',
      '.olhrrrrrrro..',
      '.orrwrrwrrro..',
      'orrrwrrrrrrrro',
      'odrrrrrrrrrrdo',
      'odrrwrrrrrrdo.',
      '.odrrrrrrrdo..',
      '..oddrrrddo...',
      '...ooddddoo...',
      '.....oooo.....',
    ],
  },
  {
    id: 'blueberry', name: '蓝莓',
    palette: { o: '#2E3560', b: '#4B5FA8', l: '#8EA6E8', w: '#D7E0FF' },
    rows: [
      '..o.o.o..',
      '.ooooooo.',
      'obbbbbbbo',
      'obllbbbbo',
      'obbllbbbo',
      'obbbbbbbo',
      '.obbbbbo.',
      '..ooooo..',
    ],
  },
  {
    id: 'cherry', name: '樱桃',
    palette: { o: '#4A2E26', r: '#D9364F', l: '#FF8FA3', w: '#FFE9B0', g: '#6B8E4E' },
    rows: [
      '....gg....',
      '...g..g...',
      '..g...g...',
      '.oo...g...',
      'orro..g...',
      'orrro.....',
      'orllro....',
      'orrwro....',
      'orrrro....',
      '.orroo....',
      '..ooo.....',
    ],
  },
  {
    id: 'mint', name: '薄荷',
    palette: { o: '#4D6B37', g: '#7DAA55', l: '#B9DD8E' },
    rows: [
      '.....oo.....',
      '...ooggoo...',
      '..oggggggo..',
      '.ogglgglggo.',
      'oggggggggggo',
      '.oggggggggo.',
      '..ooggggoo..',
      '....oooo....',
    ],
  },
  {
    id: 'heart', name: '爱心',
    palette: { o: '#8C3A55', h: '#FFB3C6', l: '#FFE3EA' },
    rows: [
      '.ooo...ooo.',
      'ohhho.ohhho',
      'ohhhhohhhho',
      'ohhhhhhhhho',
      '.ohhhhhhho.',
      '..ohhhhho..',
      '...ohhho...',
      '....oho....',
      '.....o.....',
    ],
  },
  {
    id: 'star', name: '星星',
    palette: { o: '#B07A2C', y: '#F7C948', w: '#FFF3B0' },
    rows: [
      '.....o.....',
      '....oyo....',
      '....oyo....',
      '.oooyyyooo.',
      'oyyyyyyyyyo',
      '.oooyyyooo.',
      '....oyo....',
      '....oyo....',
      '.....o.....',
    ],
  },
  {
    id: 'candle', name: '蜡烛',
    palette: { o: '#5A2A2A', p: '#F49AB4', w: '#FFF6E6', f: '#FFD75E', y: '#FFF3B0' },
    variants: [
      ['....f....', '...fyf...', '...fff...', '....o....'],
      ['...f.....', '..fyf....', '...ff....', '....o....'],
      ['....f....', '...ff....', '...fyf...', '....o....'],
    ],
    body: [
      '...ooo...',
      '..opppo..',
      '..owwwo..',
      '..opppo..',
      '..owwwo..',
      '..opppo..',
      '..owwwo..',
      '..opppo..',
      '..owwwo..',
      '..ooooo..',
    ],
  },
  {
    id: 'rosette', name: '奶油花',
    palette: { o: '#B47A8C', w: '#FFF6E6', p: '#F6B7C8' },
    rows: [
      '...ooooo...',
      '..owwwwwo..',
      '.owwpppwwo.',
      'owwpppppwwo',
      'owwpppppwwo',
      '.owwpppwwo.',
      '..owwwwwo..',
      '...ooooo...',
    ],
  },
  {
    id: 'oreo', name: '奥利奥',
    palette: { o: '#35231C', b: '#51362B', w: '#F5E7CF', c: '#B9A282' },
    rows: [
      '..ooooooooo..',
      '.obbbbbbbbbo.',
      'obbbbbbbbbbbo',
      'obwwwwcwwwwbo',
      'obwwwwcwwwwbo',
      'obbbbbbbbbbbo',
      '.obbbbbbbbbo.',
      '..ooooooooo..',
    ],
  },
  {
    id: 'macaron', name: '马卡龙',
    palette: { o: '#8C6A8E', p: '#D8B6DD', l: '#EED9F2', w: '#FFF6E6' },
    rows: [
      '...oooooo...',
      '..opllllpo..',
      '.opllllllpo.',
      'opllllllllpo',
      'opllllllllpo',
      'opppppppppo.',
      'owwwwwwwwwwo',
      'opppppppppo.',
      'opllllllllpo',
      '.opllllllpo.',
      '..opllllpo..',
      '...oooooo...',
    ],
  },
  {
    id: 'wafer', name: '威化棒',
    palette: { o: '#6B4A2F', b: '#A97450', w: '#E8C79C' },
    rows: [
      '.......oo.',
      '......obbo',
      '.....obbbo',
      '....owwbo.',
      '...owwbo..',
      '..owwbo...',
      '.owwbo....',
      '.owbo.....',
      'owbo......',
      'obo.......',
      'oo........',
    ],
  },
  {
    id: 'chocolate', name: '巧克力',
    palette: { o: '#3B2418', b: '#6B4329', l: '#A97450', w: '#E8C79C' },
    rows: [
      '.oooooo.',
      'obbbbbbo',
      'obbllbbo',
      'obllbbbo',
      'obbwbbbo',
      '.oooooo.',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

const state = {
  step: 0,
  base: null,
  basePopAt: 0,
  creamIndex: 0,
  brushIndex: 1,
  coverage: 0,
  creamPainted: false,
  creamToastShown: false,
  decorations: [],
  decoSeq: 1,
  selectedId: null,
  creamHistory: [],
  decoHistory: [],
  particles: [],
  dragHint: null,
  dropPoint: null,
  dropValid: false,
  captureMode: false,
  resetArmed: false,
};

let cardDrag = null;
let paintState = null;
let decoDrag = null;
let toastTimer = 0;
let resetTimer = 0;
let lastFrame = performance.now();

/* ------------------------------------------------------------------ */
/* 工具                                                                */
/* ------------------------------------------------------------------ */

function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fillEllipse(g, cx, cy, rx, ry, color, part = 'full') {
  if (rx <= 0 || ry <= 0) return;
  g.fillStyle = color;
  for (let dy = -ry; dy <= ry; dy++) {
    if (part === 'top' && dy > 0) continue;
    if (part === 'bottom' && dy < 0) continue;
    const t = 1 - (dy * dy) / (ry * ry);
    if (t < 0) continue;
    const half = Math.floor(rx * Math.sqrt(t));
    g.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}

function pixelText(g, text, x, y, size, color) {
  g.fillStyle = color;
  g.font = `800 ${size}px "Courier New", monospace`;
  g.textBaseline = 'top';
  g.fillText(text, x, y);
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function formatDate() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/* ------------------------------------------------------------------ */
/* 绘制蛋糕                                                            */
/* ------------------------------------------------------------------ */

function drawCakeGeom(g, geo, p, opts = {}) {
  const cx = geo.cx;
  const topY = geo.topY;
  const rx = geo.rx;
  const ry = geo.ry;
  const bodyH = geo.bodyH;
  const bottomRy = geo.bottomRy;
  const bottomY = topY + bodyH;
  const seed = (p.seed || 1) * 977 + (opts.seed || 0);

  if (opts.outline) {
    fillEllipse(g, cx, topY, rx + 1, ry + 1, OUTLINE);
    g.fillStyle = OUTLINE;
    g.fillRect(cx - rx - 1, topY, 2 * rx + 3, bodyH + 1);
    fillEllipse(g, cx, bottomY + 1, rx + 1, bottomRy + 1, OUTLINE, 'bottom');
  }

  fillEllipse(g, cx, bottomY + 2, rx, bottomRy, p.dark, 'bottom');

  g.fillStyle = p.side;
  g.fillRect(cx - rx, topY, 2 * rx + 1, bodyH);
  fillEllipse(g, cx, bottomY, rx, bottomRy, p.side, 'bottom');

  const shadeW = Math.max(3, Math.round(rx * 0.09));
  g.fillStyle = p.dark;
  g.fillRect(cx + rx - shadeW, topY, shadeW, bodyH - 12);

  const lightW = Math.max(2, Math.round(rx * 0.04));
  g.fillStyle = p.light;
  g.fillRect(cx - rx + 3, topY + 6, lightW, bodyH - 28);

  const inset = Math.max(2, Math.round(rx * 0.045));
  const bandH = Math.max(2, Math.round(bodyH * 0.06));
  const bandY1 = topY + Math.round(bodyH * 0.36);
  const bandY2 = topY + Math.round(bodyH * 0.63);

  g.fillStyle = p.band;
  g.fillRect(cx - rx + inset, bandY1, 2 * rx - inset * 2, bandH);
  g.fillStyle = p.dark;
  g.fillRect(cx - rx + inset, bandY1 + bandH, 2 * rx - inset * 2, 1);

  g.fillStyle = p.jam;
  g.fillRect(cx - rx + inset, bandY2, 2 * rx - inset * 2, Math.max(1, bandH - 1));
  g.fillStyle = p.dark;
  g.fillRect(cx - rx + inset, bandY2 + Math.max(1, bandH - 1), 2 * rx - inset * 2, 1);

  fillEllipse(g, cx, topY, rx, ry, p.topRim);
  const rim = Math.max(2, Math.round(rx * 0.045));
  fillEllipse(g, cx, topY, rx - rim, ry - rim, p.top);

  g.fillStyle = p.band;
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 1.04 + i * 0.045;
    const x = Math.round(cx + Math.cos(a) * (rx - rim - 3));
    const y = Math.round(topY + Math.sin(a) * (ry - rim - 2));
    g.fillRect(x, y, 2, 1);
  }

  const rnd = mulberry32(seed);
  const topDots = Math.max(10, Math.round((rx * ry) / 90));
  for (let i = 0; i < topDots; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 0.78;
    const x = Math.round(cx + Math.cos(a) * r * (rx - rim - 4));
    const y = Math.round(topY + Math.sin(a) * r * (ry - rim - 3));
    const pick = rnd();
    g.fillStyle = pick < 0.4 ? p.crumb : pick < 0.7 ? p.topRim : p.crumb2;
    g.fillRect(x, y, 1, 1);
  }

  const sideDots = Math.max(8, Math.round(bodyH / 4));
  for (let i = 0; i < sideDots; i++) {
    const x = Math.round(cx - rx + 6 + rnd() * (2 * rx - 12));
    const y = Math.round(topY + 10 + rnd() * (bodyH - 20));
    g.fillStyle = rnd() < 0.5 ? p.dark : p.light;
    g.fillRect(x, y, 1, 1);
  }
}

function buildBaseSprite(flavor) {
  const c = makeCanvas();
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  drawCakeGeom(g, CAKE, BASE[flavor], { outline: false, seed: 0 });
  return c;
}

function buildMiniCake(flavor) {
  const c = makeCanvas(64, 48);
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const geo = { cx: 32, topY: 19, rx: 22, ry: 8, bodyH: 20, bottomRy: 7 };
  drawCakeGeom(g, geo, BASE[flavor], { outline: true, seed: 50 });
  return c;
}

/* ------------------------------------------------------------------ */
/* 遮罩与轮廓                                                          */
/* ------------------------------------------------------------------ */

function buildMask() {
  const g = maskCanvas.getContext('2d');
  g.clearRect(0, 0, W, H);
  fillEllipse(g, CAKE.cx, CAKE.topY, CAKE.rx, CAKE.ry, '#fff');
  g.fillStyle = '#fff';
  g.fillRect(CAKE.cx - CAKE.rx, CAKE.topY, CAKE.rx * 2 + 1, CAKE.bodyH);
  fillEllipse(g, CAKE.cx, CAKE.bottomY, CAKE.rx, CAKE.bottomRy, '#fff', 'bottom');
  maskData = g.getImageData(0, 0, W, H).data;
}

function buildOutline() {
  const g = outlineCanvas.getContext('2d');
  g.clearRect(0, 0, W, H);
  fillEllipse(g, CAKE.cx, CAKE.topY, CAKE.rx + 2, CAKE.ry + 2, OUTLINE);
  g.fillStyle = OUTLINE;
  g.fillRect(CAKE.cx - CAKE.rx - 2, CAKE.topY, CAKE.rx * 2 + 5, CAKE.bodyH + 2);
  fillEllipse(g, CAKE.cx, CAKE.bottomY + 2, CAKE.rx + 2, CAKE.bottomRy + 2, OUTLINE, 'bottom');

  g.globalCompositeOperation = 'destination-out';
  fillEllipse(g, CAKE.cx, CAKE.topY, CAKE.rx, CAKE.ry, '#fff');
  g.fillStyle = '#fff';
  g.fillRect(CAKE.cx - CAKE.rx, CAKE.topY, CAKE.rx * 2 + 1, CAKE.bodyH);
  fillEllipse(g, CAKE.cx, CAKE.bottomY, CAKE.rx, CAKE.bottomRy, '#fff', 'bottom');
  g.globalCompositeOperation = 'source-over';
}

function buildBackground() {
  const g = bgCanvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#EBDABD';
  g.fillRect(0, 0, W, H);

  const rnd = mulberry32(20261125);
  for (let i = 0; i < 240; i++) {
    const x = Math.floor(rnd() * W);
    const y = Math.floor(rnd() * H);
    g.fillStyle = rnd() > 0.5 ? 'rgba(120,88,48,0.055)' : 'rgba(255,248,230,0.28)';
    g.fillRect(x, y, 1, 1);
  }
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(rnd() * W);
    const y = Math.floor(rnd() * H);
    g.fillStyle = 'rgba(110,80,44,0.045)';
    g.fillRect(x, y, 1, 2 + Math.floor(rnd() * 5));
  }

  g.fillStyle = '#E4D0AC';
  g.fillRect(0, 220, W, H - 220);
  g.fillStyle = '#D3BC93';
  g.fillRect(0, 219, W, 2);

  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * W);
    const y = 226 + Math.floor(rnd() * 88);
    g.fillStyle = 'rgba(110,80,44,0.05)';
    g.fillRect(x, y, 1, 1);
  }

  // 左下角的小盆栽
  fillEllipse(g, 59, 286, 25, 5, 'rgba(88,58,30,0.16)');
  g.fillStyle = '#5A3A2A';
  g.fillRect(38, 254, 42, 7);
  g.fillRect(42, 260, 34, 26);
  g.fillStyle = '#C9825B';
  g.fillRect(40, 256, 38, 3);
  g.fillStyle = '#B9744E';
  g.fillRect(44, 262, 30, 22);
  g.fillStyle = '#D18C63';
  g.fillRect(47, 264, 4, 16);
  g.fillStyle = '#567F36';
  g.fillRect(57, 234, 2, 22);
  g.fillRect(66, 228, 2, 28);
  g.fillRect(73, 238, 2, 18);
  fillEllipse(g, 50, 235, 9, 5, '#567F36');
  fillEllipse(g, 50, 234, 7, 3, '#7DAA55');
  fillEllipse(g, 64, 228, 10, 6, '#567F36');
  fillEllipse(g, 64, 227, 8, 4, '#7DAA55');
  fillEllipse(g, 74, 238, 8, 5, '#567F36');
  fillEllipse(g, 74, 237, 6, 3, '#7DAA55');

  // 右下角的糖珠罐
  fillEllipse(g, 424, 286, 24, 5, 'rgba(88,58,30,0.16)');
  g.fillStyle = '#4A2E26';
  g.fillRect(404, 232, 38, 52);
  g.fillStyle = '#CFE3E8';
  g.fillRect(407, 235, 32, 46);
  g.fillStyle = '#4A2E26';
  g.fillRect(402, 226, 42, 9);
  g.fillStyle = '#B07A2C';
  g.fillRect(405, 228, 36, 5);
  g.fillStyle = '#E8C79C';
  g.fillRect(408, 229, 10, 1);
  g.fillStyle = 'rgba(255,255,255,0.65)';
  g.fillRect(411, 240, 4, 34);
  g.fillStyle = 'rgba(255,255,255,0.3)';
  g.fillRect(421, 240, 2, 20);
  const candies = [
    [415, 250, '#F49AB4'], [424, 256, '#F7C948'], [417, 264, '#8FB3D9'],
    [428, 268, '#9CC578'], [422, 246, '#FFF6E6'], [430, 252, '#E94B63'],
    [412, 272, '#F7C948'], [425, 274, '#8FB3D9'],
  ];
  for (const [x, y, c] of candies) {
    g.fillStyle = c;
    g.fillRect(x, y, 2, 2);
  }

  fillEllipse(g, CAKE.cx + 4, 274, 134, 15, 'rgba(88,58,30,0.18)');

  fillEllipse(g, CAKE.cx, 249, 117, 29, '#B7A17E');
  fillEllipse(g, CAKE.cx, 246, 115, 27, '#9FB7C9');
  fillEllipse(g, CAKE.cx, 248, 111, 24, '#FFF9EC');
  fillEllipse(g, CAKE.cx, 249, 98, 19, '#F3E4C8');

  g.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) {
    g.fillRect(CAKE.cx - 96 + i * 4, 231 + i * 2, 2, 1);
  }

  g.fillStyle = '#F49AB4';
  g.fillRect(CAKE.cx - 30, 266, 2, 2);
  g.fillRect(CAKE.cx + 2, 266, 2, 2);
  g.fillRect(CAKE.cx + 32, 266, 2, 2);

  fillEllipse(g, CAKE.cx, 255, 96, 18, 'rgba(96,64,34,0.17)');
}

/* ------------------------------------------------------------------ */
/* 奶油笔刷                                                            */
/* ------------------------------------------------------------------ */

function makeBrushSprite(color, radius, variant) {
  const size = radius * 2 + 5;
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  const rnd = mulberry32(radius * 131 + variant * 977 + color.base.charCodeAt(1) * 17);
  const cx = radius + 2;
  const cy = radius + 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edge = (rnd() - 0.5) * 1.1;
      if (dist > radius + edge) continue;

      let col = color.base;
      if (dx + dy < -radius * 0.55 && rnd() < 0.022) col = color.light;
      else if (rnd() < 0.005) col = rnd() < 0.6 ? color.light : color.dark;

      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function buildBrushes() {
  for (let ci = 0; ci < CREAMS.length; ci++) {
    for (let si = 0; si < BRUSH_RADII.length; si++) {
      const arr = [];
      for (let v = 0; v < 3; v++) arr.push(makeBrushSprite(CREAMS[ci], BRUSH_RADII[si], v));
      brushSprites[`${ci}-${si}`] = arr;
    }
  }
}

/* ------------------------------------------------------------------ */
/* 装饰精灵                                                            */
/* ------------------------------------------------------------------ */

function makeSprite(rows, palette) {
  let width = 0;
  for (const row of rows) width = Math.max(width, row.length);
  const c = makeCanvas(width, rows.length);
  const g = c.getContext('2d');
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = palette[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return { canvas: c, w: width, h: rows.length };
}

function buildDecoSprites() {
  for (const def of DECO_DEFS) {
    const variants = [];
    if (def.variants) {
      for (const flame of def.variants) {
        variants.push(makeSprite([...flame, ...def.body], def.palette));
      }
    } else {
      variants.push(makeSprite(def.rows, def.palette));
    }
    decoVariants[def.id] = variants;
    decoDefsById[def.id] = def;
  }
}

function makeDecoPreview(def) {
  const c = makeCanvas(40, 40);
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const spr = decoVariants[def.id][0];
  const scale = Math.max(1, Math.min(2, Math.floor(36 / Math.max(spr.w, spr.h))));
  const dw = spr.w * scale;
  const dh = spr.h * scale;
  g.drawImage(spr.canvas, Math.floor((40 - dw) / 2), Math.floor((40 - dh) / 2), dw, dh);
  return c;
}

/* ------------------------------------------------------------------ */
/* 初始化资源                                                          */
/* ------------------------------------------------------------------ */

const maskCanvas = makeCanvas();
const outlineCanvas = makeCanvas();
const bgCanvas = makeCanvas();
const creamCanvas = makeCanvas();
const creamCtx = creamCanvas.getContext('2d', { willReadFrequently: true });
const strokeCanvas = makeCanvas();
const strokeCtx = strokeCanvas.getContext('2d');
const composedCream = makeCanvas();
const composedCtx = composedCream.getContext('2d');
creamCtx.imageSmoothingEnabled = false;
strokeCtx.imageSmoothingEnabled = false;
composedCtx.imageSmoothingEnabled = false;

let maskData = null;
const baseSprites = {};
const baseMini = {};
const baseGhosts = {};
const brushSprites = {};
const decoVariants = {};
const decoDefsById = {};

function buildAssets() {
  buildMask();
  buildOutline();
  buildBackground();
  buildBrushes();
  buildDecoSprites();
  for (const key of Object.keys(BASE)) {
    baseSprites[key] = buildBaseSprite(key);
    baseMini[key] = buildMiniCake(key);
    const crop = { x: CAKE.cx - CAKE.rx - 12, y: CAKE.topY - CAKE.ry - 12, w: CAKE.rx * 2 + 24, h: CAKE.ry + CAKE.bodyH + CAKE.bottomRy + 24 };
    const c = makeCanvas(crop.w, crop.h);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(baseSprites[key], crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    g.drawImage(outlineCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    baseGhosts[key] = c;
  }
}

/* ------------------------------------------------------------------ */
/* 界面构建                                                            */
/* ------------------------------------------------------------------ */

function buildBaseCards() {
  for (const [key, p] of Object.entries(BASE)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'base-card';
    btn.dataset.flavor = key;
    btn.setAttribute('aria-label', `选择${p.name}蛋糕胚`);

    const thumb = baseMini[key];
    const name = document.createElement('span');
    name.className = 'base-name';
    name.textContent = p.name;
    const tag = document.createElement('span');
    tag.className = 'base-tag';
    tag.textContent = p.tag;

    btn.append(thumb, name, tag);
    btn.addEventListener('pointerdown', (e) => startCardDrag(e, 'base', key, btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        placeBase(key);
      }
    });
    els.baseGrid.appendChild(btn);
  }
}

function buildCreamTools() {
  CREAMS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.dataset.index = String(i);
    btn.title = `${c.name}奶油`;
    const chip = document.createElement('i');
    chip.style.background = `linear-gradient(135deg, ${c.light} 0 26%, ${c.base} 26% 72%, ${c.dark} 72% 100%)`;
    const label = document.createElement('span');
    label.textContent = c.name;
    btn.append(chip, label);
    btn.addEventListener('click', () => {
      state.creamIndex = i;
      syncToolSelection();
    });
    els.creamSwatches.appendChild(btn);
  });

  BRUSH_RADII.forEach((r, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'brush-btn';
    btn.type = 'button';
    btn.title = ['小笔刷', '中笔刷', '大笔刷'][i];
    const dot = document.createElement('span');
    const d = 5 + i * 4;
    dot.style.width = `${d}px`;
    dot.style.height = `${d}px`;
    btn.appendChild(dot);
    btn.addEventListener('click', () => {
      state.brushIndex = i;
      syncToolSelection();
    });
    els.brushSizes.appendChild(btn);
  });
}

function buildDecoCards() {
  for (const def of DECO_DEFS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'deco-card';
    btn.dataset.type = def.id;
    btn.setAttribute('aria-label', `放置${def.name}`);

    const preview = makeDecoPreview(def);
    const name = document.createElement('span');
    name.className = 'deco-name';
    name.textContent = def.name;
    btn.append(preview, name);

    btn.addEventListener('pointerdown', (e) => startCardDrag(e, 'deco', def.id, btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        addDecoAtRandom(def.id);
      }
    });
    els.decoGrid.appendChild(btn);
  }
}

function syncToolSelection() {
  els.creamSwatches.querySelectorAll('.swatch').forEach((el, i) => {
    el.classList.toggle('is-active', i === state.creamIndex);
  });
  els.brushSizes.querySelectorAll('.brush-btn').forEach((el, i) => {
    el.classList.toggle('is-active', i === state.brushIndex);
  });
}

/* ------------------------------------------------------------------ */
/* UI 状态                                                             */
/* ------------------------------------------------------------------ */

const NOTES = [
  '先挑一块蛋糕胚，拖到盘子上。',
  '按住画布涂抹奶油，覆盖 55% 就能继续。',
  '把喜欢的装饰拖到蛋糕上，点一下也可以。',
];

function canNext() {
  if (state.step === 0) return !!state.base;
  if (state.step === 1) return state.coverage >= GOAL;
  return state.decorations.length > 0;
}

function canUndo() {
  if (state.step === 1) return state.creamHistory.length > 0;
  if (state.step === 2) return state.decoHistory.length > 0;
  return false;
}

function updateUI() {
  document.body.dataset.step = String(state.step);
  document.body.classList.toggle('modal-open', !els.finishModal.hidden);

  const chips = document.querySelectorAll('.step[data-chip]');
  chips.forEach((chip, i) => {
    const current = i === state.step;
    const done =
      (i === 0 && !!state.base) ||
      (i === 1 && state.coverage >= GOAL) ||
      (i === 2 && state.decorations.length > 0);
    chip.classList.toggle('is-current', current);
    chip.classList.toggle('is-done', done && !current);
  });

  if (state.step === 0) {
    els.noteText.textContent = state.base
      ? `盘子上是${BASE[state.base].name}蛋糕胚，拖别的口味可以替换。`
      : NOTES[0];
  } else {
    els.noteText.textContent = NOTES[state.step];
  }

  if (state.step === 0) {
    els.stageStatus.textContent = state.base ? '蛋糕胚已就位' : '等待蛋糕胚';
  } else if (state.step === 1) {
    els.stageStatus.textContent = `${Math.round(state.coverage * 100)}% 已涂抹`;
  } else {
    els.stageStatus.textContent = `${state.decorations.length} 个装饰`;
  }

  els.backBtn.disabled = state.step === 0;
  const enabled = canNext();
  els.nextBtn.disabled = !enabled;
  els.nextBtn.classList.toggle('is-ready', enabled);
  els.nextBtn.textContent = state.step === 2 ? '完成蛋糕' : '下一步';
  els.undoBtn.disabled = !canUndo();

  if (state.step === 0) {
    els.actionHint.textContent = state.base ? '可以进入下一步了' : '先把蛋糕胚放上盘子';
  } else if (state.step === 1) {
    els.actionHint.textContent =
      state.coverage >= GOAL
        ? '奶油已经抹好啦'
        : `还需要覆盖约 ${Math.ceil((GOAL - state.coverage) * 100)}%`;
  } else {
    els.actionHint.textContent =
      state.decorations.length > 0 ? '不满意可以继续调整' : '至少放一个装饰';
  }

  document.querySelectorAll('.base-card').forEach((el) => {
    el.classList.toggle('is-chosen', el.dataset.flavor === state.base);
  });

  updateCoverageUI();
  updateSelectionRow();
}

function updateCoverageUI() {
  const pct = Math.round(state.coverage * 100);
  els.coveragePct.textContent = `${pct}%`;
  els.coverageBar.style.width = `${pct}%`;
  const ready = state.coverage >= GOAL;
  els.coverageMeter.classList.toggle('is-ready', ready);
  els.coverageHint.classList.toggle('is-ready', ready);
  els.coverageHint.textContent = ready ? '可以继续啦 →' : '达到 55% 就能继续';
}

function updateSelectionRow() {
  const selected = state.decorations.find((d) => d.id === state.selectedId);
  if (!selected) state.selectedId = null;
  els.selectionRow.hidden = !selected;
  if (selected) {
    els.selectionName.textContent = decoDefsById[selected.type].name;
  }
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('is-show'), 1800);
}

/* ------------------------------------------------------------------ */
/* 步骤                                                                */
/* ------------------------------------------------------------------ */

function setStep(step) {
  if (step < 0 || step > 2) return;
  if (step >= 1 && !state.base) {
    toast('先放一块蛋糕胚吧');
    return;
  }
  if (step === 2 && state.coverage < GOAL) {
    toast('奶油再多抹一点');
    return;
  }
  const entered = step !== state.step;
  state.step = step;
  state.selectedId = null;
  state.dragHint = null;
  updateUI();
  render(performance.now());
  if (entered && step === 2) {
    setTimeout(() => toast('装饰好的蛋糕可以保存哦'), 350);
  }
}

/* ------------------------------------------------------------------ */
/* 蛋糕胚                                                              */
/* ------------------------------------------------------------------ */

function placeBase(flavor) {
  if (!BASE[flavor]) return;
  if (state.base === flavor) {
    state.basePopAt = performance.now();
    toast('蛋糕胚已经在盘子上啦');
    return;
  }

  const hadWork = state.coverage > 0.001 || state.decorations.length > 0;
  state.base = flavor;
  state.basePopAt = performance.now();
  clearCream();
  state.decorations = [];
  state.selectedId = null;
  state.creamHistory = [];
  state.decoHistory = [];
  state.step = 0;
  state.creamToastShown = false;

  spawnParticles(CAKE.cx, CAKE.bottomY - 6, 14);
  updateUI();
  render(performance.now());
  toast(hadWork ? '换了一块新蛋糕胚，重新开始抹奶油' : `${BASE[flavor].name}蛋糕胚放好啦`);
}

function clearCream() {
  creamCtx.clearRect(0, 0, W, H);
  strokeCtx.clearRect(0, 0, W, H);
  state.creamPainted = false;
  state.coverage = 0;
  state.creamToastShown = false;
}

/* ------------------------------------------------------------------ */
/* 奶油涂抹                                                            */
/* ------------------------------------------------------------------ */

function applyMaskToCream() {
  creamCtx.globalCompositeOperation = 'destination-in';
  creamCtx.drawImage(maskCanvas, 0, 0);
  creamCtx.globalCompositeOperation = 'source-over';
}

function composeCream() {
  composedCtx.clearRect(0, 0, W, H);
  composedCtx.drawImage(creamCanvas, 0, 0);
  composedCtx.drawImage(strokeCanvas, 0, 0);
  composedCtx.globalCompositeOperation = 'destination-in';
  composedCtx.drawImage(maskCanvas, 0, 0);
  composedCtx.globalCompositeOperation = 'source-over';
}

function isOnCake(x, y) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= W || py >= H) return false;
  return maskData[(py * W + px) * 4 + 3] > 0;
}

function stampAt(x, y) {
  const arr = brushSprites[`${state.creamIndex}-${state.brushIndex}`];
  if (!arr) return;
  const sprite = arr[Math.floor(Math.random() * arr.length)];
  strokeCtx.drawImage(sprite, Math.round(x) - Math.floor(sprite.width / 2), Math.round(y) - Math.floor(sprite.height / 2));
}

function pushCreamHistory() {
  const snap = makeCanvas();
  snap.getContext('2d').drawImage(creamCanvas, 0, 0);
  state.creamHistory.push(snap);
  if (state.creamHistory.length > 20) state.creamHistory.shift();
}

function commitStroke() {
  creamCtx.drawImage(strokeCanvas, 0, 0);
  strokeCtx.clearRect(0, 0, W, H);
  applyMaskToCream();
  state.creamPainted = true;
  computeCoverage();
  updateUI();
  render(performance.now());
  if (state.coverage >= GOAL && !state.creamToastShown) {
    state.creamToastShown = true;
    toast('奶油抹好啦，可以去装饰了');
  }
}

function computeCoverage() {
  if (!state.base) {
    state.coverage = 0;
    return 0;
  }
  const data = creamCtx.getImageData(0, 0, W, H).data;
  let hit = 0;
  let total = 0;
  const x0 = CAKE.cx - CAKE.rx;
  const x1 = CAKE.cx + CAKE.rx;
  const y0 = CAKE.topY - CAKE.ry;
  const y1 = CAKE.bottomY + CAKE.bottomRy;
  for (let y = y0; y <= y1; y += 2) {
    for (let x = x0; x <= x1; x += 2) {
      const idx = (y * W + x) * 4;
      if (maskData[idx + 3] === 0) continue;
      total++;
      if (data[idx + 3] > 0) hit++;
    }
  }
  state.coverage = total ? hit / total : 0;
  return state.coverage;
}

/* ------------------------------------------------------------------ */
/* 装饰                                                                */
/* ------------------------------------------------------------------ */

function decoSprite(type) {
  const variants = decoVariants[type];
  return variants ? variants[0] : null;
}

function randomTopPoint() {
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const x = CAKE.cx + Math.cos(a) * r * (CAKE.rx - 34);
    const y = CAKE.topY + Math.sin(a) * r * (CAKE.ry - 15);
    if (state.decorations.every((d) => Math.hypot(d.x - x, d.y - y) > 26)) {
      return { x, y };
    }
  }
  return { x: CAKE.cx, y: CAKE.topY };
}

function isTopPoint(x, y) {
  const nx = (x - CAKE.cx) / (CAKE.rx - 8);
  const ny = (y - CAKE.topY) / (CAKE.ry - 4);
  return nx * nx + ny * ny <= 1;
}

function pushDecoHistory() {
  state.decoHistory.push(state.decorations.map((d) => ({ ...d })));
  if (state.decoHistory.length > 25) state.decoHistory.shift();
}

function addDecoration(type, x, y) {
  if (!state.base) return;
  if (!decoDefsById[type]) return;
  pushDecoHistory();
  const d = {
    id: state.decoSeq++,
    type,
    x: Math.round(clamp(x, 6, W - 6)),
    y: Math.round(clamp(y, 6, H - 6)),
    seed: Math.random() * 10,
  };
  state.decorations.push(d);
  state.selectedId = d.id;
  spawnParticles(d.x, d.y, 10);
  updateUI();
  render(performance.now());
}

function addDecoAtRandom(type) {
  if (!state.base) return;
  const p = randomTopPoint();
  addDecoration(type, p.x, p.y);
  toast(`放上了一个${decoDefsById[type].name}`);
}

function hitTestDecorations(x, y) {
  for (let i = state.decorations.length - 1; i >= 0; i--) {
    const d = state.decorations[i];
    const spr = decoSprite(d.type);
    if (!spr) continue;
    if (Math.abs(x - d.x) <= (spr.w * DECO_SCALE) / 2 + 2 && Math.abs(y - d.y) <= (spr.h * DECO_SCALE) / 2 + 2) {
      return d;
    }
  }
  return null;
}

function deleteSelected() {
  const idx = state.decorations.findIndex((d) => d.id === state.selectedId);
  if (idx < 0) return;
  pushDecoHistory();
  state.decorations.splice(idx, 1);
  state.selectedId = null;
  updateUI();
  render(performance.now());
}

/* ------------------------------------------------------------------ */
/* 撤销                                                                */
/* ------------------------------------------------------------------ */

function undo() {
  if (state.step === 1 && state.creamHistory.length) {
    const snap = state.creamHistory.pop();
    creamCtx.clearRect(0, 0, W, H);
    creamCtx.drawImage(snap, 0, 0);
    strokeCtx.clearRect(0, 0, W, H);
    state.creamPainted = true;
    computeCoverage();
    if (state.coverage < GOAL) state.creamToastShown = false;
    updateUI();
    render(performance.now());
  } else if (state.step === 2 && state.decoHistory.length) {
    state.decorations = state.decoHistory.pop();
    state.selectedId = null;
    updateUI();
    render(performance.now());
  }
}

/* ------------------------------------------------------------------ */
/* 粒子                                                                */
/* ------------------------------------------------------------------ */

function spawnParticles(x, y, count) {
  const colors = ['#F49AB4', '#F7C948', '#FFF6E6', '#9CC578', '#8FB3D9'];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.4;
    state.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 0.8,
      life: 1,
      size: Math.random() < 0.3 ? 2 : 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function updateParticles(now) {
  const dt = Math.min(50, now - lastFrame);
  const k = dt / 16.7;
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * k;
    p.y += p.vy * k;
    p.vy += 0.06 * k;
    p.life -= 0.022 * k;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

function dashedEllipse(cx, cy, rx, ry, color, now, speed = 140) {
  const n = 64;
  const offset = Math.floor(now / speed);
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    if ((i + offset) % 2 !== 0) continue;
    const a = (i / n) * Math.PI * 2;
    ctx.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 2, 2);
  }
}

function drawSparkles(now) {
  for (const s of SPARKLES) {
    const a = 0.18 + 0.4 * (0.5 + 0.5 * Math.sin(now / 900 + s.p));
    ctx.globalAlpha = a;
    ctx.fillStyle = s.c;
    ctx.fillRect(s.x, s.y - 2, 1, 5);
    ctx.fillRect(s.x - 2, s.y, 5, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPlateHint(now, strong) {
  const color = strong ? '#F7C948' : 'rgba(247,201,72,0.75)';
  dashedEllipse(CAKE.cx, 247, CAKE.rx + 24, 25, color, now, strong ? 90 : 180);
}

function drawTopHint(now) {
  const ok = state.dropValid;
  const color = ok ? '#7DAA55' : '#D25454';
  fillEllipse(ctx, CAKE.cx, CAKE.topY, CAKE.rx - 8, CAKE.ry - 4, ok ? 'rgba(255,255,255,0.25)' : 'rgba(210,84,84,0.10)');
  dashedEllipse(CAKE.cx, CAKE.topY, CAKE.rx - 8, CAKE.ry - 4, color, now, 100);
}

function drawDecorations(now) {
  ctx.save();
  for (const d of state.decorations) {
    const variants = decoVariants[d.type];
    if (!variants) continue;
    const spr = variants[Math.floor(now / 170 + d.seed) % variants.length];
    const dw = spr.w * DECO_SCALE;
    const dh = spr.h * DECO_SCALE;
    ctx.drawImage(spr.canvas, Math.round(d.x - dw / 2), Math.round(d.y - dh / 2), dw, dh);
  }
  ctx.restore();
}

function drawSelection() {
  const d = state.decorations.find((item) => item.id === state.selectedId);
  if (!d) return;
  const spr = decoSprite(d.type);
  if (!spr) return;
  const w = spr.w * DECO_SCALE + 6;
  const h = spr.h * DECO_SCALE + 6;
  const x = Math.round(d.x - w / 2);
  const y = Math.round(d.y - h / 2);
  ctx.fillStyle = '#F49AB4';
  for (let i = 0; i < w; i += 4) {
    ctx.fillRect(x + i, y, 2, 1);
    ctx.fillRect(x + i, y + h - 1, 2, 1);
  }
  for (let i = 0; i < h; i += 4) {
    ctx.fillRect(x, y + i, 1, 2);
    ctx.fillRect(x + w - 1, y + i, 1, 2);
  }
}

function drawCakeForm() {
  // 侧面体积感：在蛋糕轮廓内加一层很淡的左右明暗
  ctx.save();
  const silhouette = new Path2D();
  silhouette.ellipse(CAKE.cx, CAKE.topY, CAKE.rx, CAKE.ry, 0, 0, Math.PI * 2);
  silhouette.rect(CAKE.cx - CAKE.rx, CAKE.topY, CAKE.rx * 2, CAKE.bodyH);
  silhouette.ellipse(CAKE.cx, CAKE.bottomY, CAKE.rx, CAKE.bottomRy, 0, 0, Math.PI * 2);
  ctx.clip(silhouette);
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(CAKE.cx + CAKE.rx - 18, CAKE.topY, 18, CAKE.bodyH + 26);
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(CAKE.cx - CAKE.rx, CAKE.topY + 10, 6, CAKE.bodyH - 20);
  ctx.restore();

  // 顶面提亮
  ctx.save();
  ctx.globalAlpha = 0.11;
  fillEllipse(ctx, CAKE.cx, CAKE.topY, CAKE.rx, CAKE.ry, '#ffffff');
  ctx.restore();

  // 顶面前沿的高光与结构线
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let x = -CAKE.rx; x <= CAKE.rx; x++) {
    const t = 1 - (x * x) / (CAKE.rx * CAKE.rx);
    if (t < 0) continue;
    const y = Math.round(CAKE.topY + (CAKE.ry - 3) * Math.sqrt(t));
    ctx.fillRect(CAKE.cx + x, y, 1, 1);
  }

  ctx.fillStyle = 'rgba(74,46,38,0.2)';
  for (let x = -CAKE.rx; x <= CAKE.rx; x++) {
    const t = 1 - (x * x) / (CAKE.rx * CAKE.rx);
    if (t < 0) continue;
    const y = Math.round(CAKE.topY + (CAKE.ry - 1) * Math.sqrt(t));
    ctx.fillRect(CAKE.cx + x, y, 1, 1);
  }

  // 左上高光
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let x = -CAKE.rx + 12; x <= -CAKE.rx + 52; x++) {
    const t = 1 - (x * x) / (CAKE.rx * CAKE.rx);
    if (t < 0) continue;
    const y = Math.round(CAKE.topY - (CAKE.ry - 7) * Math.sqrt(t));
    ctx.fillRect(CAKE.cx + x, y, 1, 1);
  }
}

function basePopOffset(now) {
  if (!state.basePopAt) return 0;
  const t = (now - state.basePopAt) / 380;
  if (t < 0 || t >= 1) return 0;
  return -Math.round(Math.sin(t * Math.PI) * 9);
}

function render(now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  ctx.drawImage(bgCanvas, 0, 0);
  drawSparkles(now);

  if (state.base) {
    const pop = state.captureMode ? 0 : basePopOffset(now);
    ctx.save();
    ctx.translate(0, pop);
    ctx.drawImage(baseSprites[state.base], 0, 0);
    composeCream();
    ctx.drawImage(composedCream, 0, 0);
    drawCakeForm();
    ctx.drawImage(outlineCanvas, 0, 0);
    ctx.restore();

    drawDecorations(now);

    if (!state.captureMode && state.dragHint === 'base') {
      drawPlateHint(now, true);
    }
  } else {
    if (!state.captureMode) drawPlateHint(now, state.dragHint === 'base');
  }

  if (!state.captureMode && state.dragHint === 'deco') {
    drawTopHint(now);
  }

  if (!state.captureMode && state.selectedId) {
    drawSelection();
  }

  if (!state.captureMode) drawParticles();
}

/* ------------------------------------------------------------------ */
/* 指针：卡片拖放                                                      */
/* ------------------------------------------------------------------ */

function startCardDrag(e, kind, type, card) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (cardDrag || paintState || decoDrag) return;
  if (kind === 'base' && state.step !== 0) return;
  if (kind === 'deco' && state.step !== 2) return;

  const stageRect = canvas.getBoundingClientRect();
  const stageScale = stageRect.width / W;
  let preview;
  let previewScale = 1;
  let anchorX;
  let anchorY;

  if (kind === 'base') {
    preview = baseGhosts[type];
    anchorX = 100;
    anchorY = 82;
  } else {
    const spr = decoSprite(type);
    if (!spr) return;
    preview = spr.canvas;
    previewScale = DECO_SCALE;
    anchorX = (spr.w * DECO_SCALE) / 2;
    anchorY = (spr.h * DECO_SCALE) / 2;
  }

  cardDrag = {
    kind,
    type,
    card,
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
    ghost: null,
    preview,
    previewScale,
    anchorX,
    anchorY,
    scale: kind === 'deco' ? Math.max(stageScale, 1) : Math.max(stageScale, 0.9),
    overStage: false,
  };
  e.preventDefault();
}

function createGhost() {
  if (!cardDrag) return;
  const c = document.createElement('canvas');
  c.width = cardDrag.preview.width * cardDrag.previewScale;
  c.height = cardDrag.preview.height * cardDrag.previewScale;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(cardDrag.preview, 0, 0, c.width, c.height);
  c.className = 'drag-ghost';
  c.style.width = `${c.width * cardDrag.scale}px`;
  c.style.height = `${c.height * cardDrag.scale}px`;
  c.style.transform = 'translate3d(-9999px, -9999px, 0)';
  els.ghostLayer.appendChild(c);
  cardDrag.ghost = c;
}

function dragAnchorPoint(e) {
  const lift = e.pointerType === 'touch' ? 18 : 0;
  return { x: e.clientX, y: e.clientY - lift };
}

function overStagePoint(x, y) {
  const rect = canvas.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function updateCardDrag(e) {
  if (!cardDrag || e.pointerId !== cardDrag.pointerId) return;
  const dx = e.clientX - cardDrag.startX;
  const dy = e.clientY - cardDrag.startY;
  if (!cardDrag.moved && Math.hypot(dx, dy) > 5) {
    cardDrag.moved = true;
    createGhost();
    cardDrag.card.style.opacity = '0.55';
  }
  if (!cardDrag.moved) return;

  e.preventDefault();
  const dp = dragAnchorPoint(e);
  const ghost = cardDrag.ghost;
  const gx = dp.x - cardDrag.anchorX * cardDrag.scale;
  const gy = dp.y - cardDrag.anchorY * cardDrag.scale;
  ghost.style.transform = `translate3d(${Math.round(gx)}px, ${Math.round(gy)}px, 0)`;

  const over = overStagePoint(dp.x, dp.y);
  cardDrag.overStage = over;

  if (cardDrag.kind === 'base') {
    state.dragHint = over ? 'base' : null;
    state.dropPoint = null;
    state.dropValid = over;
  } else if (over) {
    const p = toLogical(dp.x, dp.y);
    state.dragHint = 'deco';
    state.dropPoint = p;
    state.dropValid = isTopPoint(p.x, p.y);
  } else {
    state.dragHint = null;
    state.dropPoint = null;
    state.dropValid = false;
  }
}

function finishCardDrag(e) {
  if (!cardDrag || e.pointerId !== cardDrag.pointerId) return;
  const drag = cardDrag;
  cardDrag = null;
  drag.card.style.opacity = '';

  if (drag.ghost) drag.ghost.remove();

  const dp = dragAnchorPoint(e);
  const over = overStagePoint(dp.x, dp.y);
  let placed = false;

  if (drag.kind === 'base') {
    if (!drag.moved || over) {
      placeBase(drag.type);
      placed = true;
    }
  } else if (drag.moved) {
    if (over) {
      const p = toLogical(dp.x, dp.y);
      if (isTopPoint(p.x, p.y)) {
        addDecoration(drag.type, p.x, p.y);
        placed = true;
      } else {
        toast('放在蛋糕上面哦');
      }
    }
  } else {
    addDecoAtRandom(drag.type);
    placed = true;
  }

  state.dragHint = null;
  state.dropPoint = null;
  state.dropValid = false;
  render(performance.now());
  return placed;
}

/* ------------------------------------------------------------------ */
/* 指针：画布                                                          */
/* ------------------------------------------------------------------ */

function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (cardDrag) return;

  const p = toLogical(e.clientX, e.clientY);

  if (state.step === 1 && state.base) {
    if (!isOnCake(p.x, p.y)) return;
    e.preventDefault();
    pushCreamHistory();
    paintState = { pointerId: e.pointerId, last: p };
    stampAt(p.x, p.y);
    updateUI();
    render(performance.now());
    return;
  }

  if (state.step === 2) {
    e.preventDefault();
    const hit = hitTestDecorations(p.x, p.y);
    state.selectedId = hit ? hit.id : null;
    updateSelectionRow();
    if (hit) {
      decoDrag = {
        pointerId: e.pointerId,
        id: hit.id,
        offsetX: hit.x - p.x,
        offsetY: hit.y - p.y,
        moved: false,
      };
    }
    render(performance.now());
  }
});

function updatePaintPointer(e) {
  if (!paintState || e.pointerId !== paintState.pointerId) return;
  e.preventDefault();
  const p = toLogical(e.clientX, e.clientY);
  const last = paintState.last;
  const dx = p.x - last.x;
  const dy = p.y - last.y;
  const dist = Math.hypot(dx, dy);
  const radius = BRUSH_RADII[state.brushIndex];
  const spacing = Math.max(2, radius * 0.5);
  const steps = Math.max(1, Math.ceil(dist / spacing));
  for (let i = 1; i <= steps; i++) {
    stampAt(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
  }
  paintState.last = p;
  render(performance.now());
}

function finishPaintPointer(e) {
  if (!paintState || e.pointerId !== paintState.pointerId) return;
  paintState = null;
  commitStroke();
}

function updateDecoDrag(e) {
  if (!decoDrag || e.pointerId !== decoDrag.pointerId) return;
  e.preventDefault();
  const item = state.decorations.find((d) => d.id === decoDrag.id);
  if (!item) return;
  if (!decoDrag.moved) {
    decoDrag.moved = true;
    pushDecoHistory();
  }
  const p = toLogical(e.clientX, e.clientY);
  item.x = Math.round(clamp(p.x + decoDrag.offsetX, 0, W));
  item.y = Math.round(clamp(p.y + decoDrag.offsetY, 0, H));
  render(performance.now());
}

function finishDecoDrag(e) {
  if (!decoDrag || e.pointerId !== decoDrag.pointerId) return;
  decoDrag = null;
  updateUI();
  render(performance.now());
}

window.addEventListener('pointermove', (e) => {
  if (paintState) {
    updatePaintPointer(e);
  } else if (decoDrag) {
    updateDecoDrag(e);
  } else if (cardDrag) {
    updateCardDrag(e);
  }
}, { passive: false });

window.addEventListener('pointerup', (e) => {
  if (paintState) finishPaintPointer(e);
  else if (decoDrag) finishDecoDrag(e);
  else if (cardDrag) finishCardDrag(e);
});

window.addEventListener('pointercancel', (e) => {
  if (paintState) {
    paintState = null;
    strokeCtx.clearRect(0, 0, W, H);
    render(performance.now());
  } else if (decoDrag) {
    decoDrag = null;
    render(performance.now());
  } else if (cardDrag) {
    if (cardDrag.ghost) cardDrag.ghost.remove();
    cardDrag.card.style.opacity = '';
    cardDrag = null;
    state.dragHint = null;
    state.dropPoint = null;
    state.dropValid = false;
    render(performance.now());
  }
});

/* ------------------------------------------------------------------ */
/* 成品                                                                */
/* ------------------------------------------------------------------ */

function buildFinishImage() {
  const previousCapture = state.captureMode;
  state.captureMode = true;
  render(performance.now());

  const scale = 3;
  const cropX = 105;
  const cropY = 92;
  const cropW = 270;
  const cropH = 210;
  const margin = 48;
  const captionH = 92;
  const aw = cropW * scale;
  const ah = cropH * scale;
  const out = makeCanvas(aw + margin * 2, ah + margin * 2 + captionH);
  const g = out.getContext('2d');
  g.imageSmoothingEnabled = false;

  g.fillStyle = '#E8D8B8';
  g.fillRect(0, 0, out.width, out.height);

  const rnd = mulberry32(42);
  for (let i = 0; i < 180; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(120,88,48,0.05)' : 'rgba(255,248,230,0.3)';
    g.fillRect(Math.floor(rnd() * out.width), Math.floor(rnd() * out.height), 1, 1);
  }

  g.fillStyle = OUTLINE;
  g.fillRect(margin - 18, margin - 18, aw + 36, ah + 36);
  g.fillStyle = '#FFF9EC';
  g.fillRect(margin - 12, margin - 12, aw + 24, ah + 24);
  g.drawImage(canvas, cropX, cropY, cropW, cropH, margin, margin, aw, ah);

  g.fillStyle = OUTLINE;
  g.font = '800 30px "Courier New", monospace';
  g.textBaseline = 'top';
  g.fillText('MY PIXEL CAKE', margin, margin + ah + 28);

  g.font = '700 20px "Courier New", monospace';
  g.textAlign = 'right';
  g.fillText(formatDate(), out.width - margin, margin + ah + 36);
  g.textAlign = 'left';

  g.fillStyle = '#E94B63';
  g.fillRect(margin + 286, margin + ah + 40, 5, 5);
  g.fillRect(margin + 294, margin + ah + 34, 3, 3);

  state.captureMode = previousCapture;
  render(performance.now());
  return out.toDataURL('image/png');
}

function buildConfetti() {
  const existing = els.finishModal.querySelector('.confetti');
  if (existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  const colors = ['#F49AB4', '#F7C948', '#9CC578', '#8FB3D9', '#FFF6E6'];
  for (let i = 0; i < 22; i++) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.width = `${3 + Math.floor(Math.random() * 4)}px`;
    bit.style.height = `${5 + Math.floor(Math.random() * 5)}px`;
    bit.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    bit.style.animationDelay = `${Math.random() * 1.8}s`;
    wrap.appendChild(bit);
  }
  els.finishModal.insertBefore(wrap, els.finishModal.firstChild);
}

function showFinish() {
  if (!state.base || state.decorations.length === 0) return;
  state.selectedId = null;
  state.dragHint = null;
  updateSelectionRow();
  render(performance.now());
  const url = buildFinishImage();
  els.finishImg.src = url;
  els.finishDate.textContent = formatDate();
  els.finishModal.hidden = false;
  buildConfetti();
  document.body.classList.add('modal-open');
}

function closeFinish() {
  els.finishModal.hidden = true;
  const confetti = els.finishModal.querySelector('.confetti');
  if (confetti) confetti.remove();
  document.body.classList.remove('modal-open');
}

function downloadImage() {
  if (!els.finishImg.src) return;
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const link = document.createElement('a');
  link.href = els.finishImg.src;
  link.download = `pixel-cake-${stamp}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast('图片已经保存');
}

/* ------------------------------------------------------------------ */
/* 重置                                                                */
/* ------------------------------------------------------------------ */

function resetAll(silent) {
  if (cardDrag) {
    if (cardDrag.ghost) cardDrag.ghost.remove();
    cardDrag = null;
  }
  paintState = null;
  decoDrag = null;
  state.base = DEFAULT_BASE;
  state.basePopAt = 0;
  state.step = 0;
  state.selectedId = null;
  state.decorations = [];
  state.creamHistory = [];
  state.decoHistory = [];
  state.particles = [];
  state.dragHint = null;
  state.dropPoint = null;
  state.dropValid = false;
  state.creamToastShown = false;
  clearCream();
  closeFinish();
  updateUI();
  render(performance.now());
  if (!silent) toast('新的蛋糕，重新开始');
}

/* ------------------------------------------------------------------ */
/* 事件绑定                                                            */
/* ------------------------------------------------------------------ */

els.nextBtn.addEventListener('click', () => {
  if (state.step < 2) {
    if (canNext()) setStep(state.step + 1);
  } else if (state.decorations.length > 0) {
    showFinish();
  }
});

els.backBtn.addEventListener('click', () => setStep(Math.max(0, state.step - 1)));

els.undoBtn.addEventListener('click', undo);

els.resetBtn.addEventListener('click', () => {
  if (state.resetArmed) {
    state.resetArmed = false;
    clearTimeout(resetTimer);
    resetAll();
    return;
  }
  state.resetArmed = true;
  toast('再点一次「重来」就会清空');
  resetTimer = setTimeout(() => {
    state.resetArmed = false;
  }, 2500);
});

els.deleteSel.addEventListener('click', deleteSelected);
els.downloadBtn.addEventListener('click', downloadImage);
els.againBtn.addEventListener('click', () => {
  closeFinish();
  resetAll();
});
els.closeFinishBtn.addEventListener('click', closeFinish);

document.querySelector('.modal-backdrop').addEventListener('click', closeFinish);

window.addEventListener('keydown', (e) => {
  if (!els.finishModal.hidden) {
    if (e.key === 'Escape') closeFinish();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
    return;
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
    e.preventDefault();
    deleteSelected();
  }
});

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

function loop(now) {
  updateParticles(now);
  render(now);
  lastFrame = now;
  requestAnimationFrame(loop);
}

buildAssets();
buildBaseCards();
buildCreamTools();
buildDecoCards();
state.base = DEFAULT_BASE;
syncToolSelection();
updateUI();
render(performance.now());
requestAnimationFrame(loop);

if (params.has('debug')) {
  window.CakeGame = {
    state,
    canvas,
    placeBase,
    addDecoration,
    addDecoAtRandom,
    setStep,
    resetAll,
    showFinish,
    computeCoverage,
    updateUI,
    render,
    outlineCanvas,
    maskCanvas,
    bgCanvas,
    creamCanvas,
  };
}
