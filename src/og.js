/* Zero-dependency PNG generator for Open Graph cards and favicons.
 * Produces clean blueprint-styled social preview cards for each category hub.
 */
const zlib = require("zlib");

const W = 1200, H = 630;

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) { c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) { c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); }
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const GLYPHS = {
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  B: ["11110","10001","10001","11110","10001","10001","11110"],
  C: ["01110","10001","10000","10000","10000","10001","01110"],
  D: ["11100","10010","10001","10001","10001","10010","11100"],
  E: ["11111","10000","10000","11110","10000","10000","11111"],
  F: ["11111","10000","10000","11110","10000","10000","10000"],
  G: ["01110","10001","10000","10111","10001","10001","01110"],
  H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["11111","00100","00100","00100","00100","00100","11111"],
  J: ["00111","00010","00010","00010","10010","10010","01100"],
  K: ["10001","10010","10100","11000","10100","10010","10001"],
  L: ["10000","10000","10000","10000","10000","10000","11111"],
  M: ["10001","11011","10101","10101","10001","10001","10001"],
  N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  Q: ["01110","10001","10001","10001","10101","10010","01101"],
  R: ["11110","10001","10001","11110","10100","10010","10001"],
  S: ["01111","10000","10000","01110","00001","00001","11110"],
  T: ["11111","00100","00100","00100","00100","00100","00100"],
  U: ["10001","10001","10001","10001","10001","10001","01110"],
  V: ["10001","10001","10001","10001","10001","01010","00100"],
  W: ["10001","10001","10001","10101","10101","11011","10001"],
  X: ["10001","10001","01010","00100","01010","10001","10001"],
  Y: ["10001","10001","01010","00100","00100","00100","00100"],
  Z: ["11111","00001","00010","00100","01000","10000","11111"],
  "&": ["01100","10010","10100","01000","10101","10010","01101"],
  ".": ["00000","00000","00000","00000","00000","01100","01100"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
};

function canvas(w, h, bg) {
  const px = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    px[i * 3] = bg[0]; px[i * 3 + 1] = bg[1]; px[i * 3 + 2] = bg[2];
  }
  return {
    rect(x, y, rw, rh, color) {
      const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
      const x1 = Math.min(w, Math.round(x + rw)), y1 = Math.min(h, Math.round(y + rh));
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const o = (yy * w + xx) * 3;
          px[o] = color[0]; px[o + 1] = color[1]; px[o + 2] = color[2];
        }
      }
    },
    text(str, x, y, pxSize, gap, color) {
      let cx = x;
      for (const ch of str.toUpperCase()) {
        const g = GLYPHS[ch];
        if (g) {
          for (let r = 0; r < g.length; r++) {
            for (let c = 0; c < g[r].length; c++) {
              if (g[r][c] === "1") { this.rect(cx + c * pxSize, y + r * pxSize, pxSize, pxSize, color); }
            }
          }
        }
        cx += 5 * pxSize + gap;
      }
      return cx - gap - x;
    },
    png() {
      const raw = Buffer.alloc(h * (w * 3 + 1));
      for (let y = 0; y < h; y++) {
        raw[y * (w * 3 + 1)] = 0;
        px.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
      }
      const ihdr = Buffer.alloc(13);
      ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
      ihdr[8] = 8; ihdr[9] = 2;
      return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", ihdr),
        chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
        chunk("IEND", Buffer.alloc(0)),
      ]);
    },
  };
}

function ogImage(subtitle = "BUILDING MATERIAL & COST CALCULATORS", kicker = "FREE US HOME PROJECT TOOLS") {
  const ACCENT = [0xc2, 0x41, 0x0c];
  const BG = [0xf7, 0xf6, 0xf2];
  const GRID = [0xeb, 0xe8, 0xdf];
  const CARD = [0xff, 0xff, 0xff];
  const BORDER = [0xdc, 0xd8, 0xcc];
  const INK = [0x1d, 0x23, 0x2b];
  const MUTED = [0x5b, 0x65, 0x73];
  const c = canvas(W, H, BG);

  // Subtle architectural grid
  for (let x = 40; x < W; x += 40) c.rect(x, 0, 1, H, GRID);
  for (let y = 40; y < H; y += 40) c.rect(0, y, W, 1, GRID);

  // Clean elevated card
  c.rect(72, 72, W - 144, H - 144, BORDER);
  c.rect(74, 74, W - 148, H - 148, CARD);

  // Top accent rule
  c.rect(74, 74, W - 148, 10, ACCENT);

  // Carpenter's square mark
  const s = 38, ox = 136, oy = 160;
  c.rect(ox, oy, s * 1.55, s * 6.2, ACCENT);
  c.rect(ox, oy + s * 4.65, s * 6.2, s * 1.55, ACCENT);
  for (let i = 1; i <= 4; i++) c.rect(ox + s * 0.35, oy + s * i, s * 0.48, 6, CARD);
  for (let i = 2; i <= 5; i++) c.rect(ox + s * i, oy + s * 5.35, 6, s * 0.48, CARD);

  // Kicker + Wordmark + Subtitle
  c.text(kicker, 430, 178, 3, 4, ACCENT);
  c.text("RULER SQUARE", 430, 224, 10, 8, INK);
  c.rect(430, 314, 140, 5, ACCENT);

  // Wrap subtitle cleanly across two lines if long
  const words = subtitle.split(" ");
  let line1 = "", line2 = "";
  for (const w of words) {
    if ((line1 + " " + w).trim().length <= 24) line1 = (line1 + " " + w).trim();
    else line2 = (line2 + " " + w).trim();
  }
  c.text(line1, 430, 344, 4, 4, INK);
  if (line2) c.text(line2, 430, 386, 4, 4, INK);
  c.text("RULERSQUARE.COM", 430, 456, 3, 4, MUTED);

  return c.png();
}

function faviconImage(size = 192) {
  const ACCENT = [0xc2, 0x41, 0x0c];
  const BG = [0xf7, 0xf6, 0xf2];
  const c = canvas(size, size, BG);
  const u = size / 32;

  c.rect(4 * u, 4 * u, 7 * u, 24 * u, ACCENT);
  c.rect(4 * u, 21 * u, 24 * u, 7 * u, ACCENT);
  for (const y of [8, 12, 16]) { c.rect(8 * u, y * u, 2 * u, 1.6 * u, BG); }
  for (const x of [14, 18, 22]) { c.rect(x * u, 24 * u, 1.6 * u, 2 * u, BG); }
  return c.png();
}

module.exports = { ogImage, faviconImage };
