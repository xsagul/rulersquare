/* Minimal PNG writer for the Open Graph card.
 *
 * Social platforms and AI crawlers will not render an SVG og:image, and we do
 * not want a build dependency just to draw four rectangles, so we rasterise
 * into an RGB buffer and deflate it with Node's own zlib.
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

/* A 5×7 bitmap face, drawn as scaled blocks. Only the glyphs the card needs.
 * Embedding a real font file to set two lines of type would cost more than the
 * whole rest of the build. */
const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10011", "01111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

/* A flat RGB canvas with a rectangle painter — enough for a geometric mark. */
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
    /* Draws text at `px` pixels per bitmap cell. Returns the width used. */
    text(str, x, y, px, gap, color) {
      let cx = x;
      for (const ch of str.toUpperCase()) {
        const g = GLYPHS[ch];
        if (g) {
          for (let r = 0; r < g.length; r++) {
            for (let c = 0; c < g[r].length; c++) {
              if (g[r][c] === "1") { this.rect(cx + c * px, y + r * px, px, px, color); }
            }
          }
        }
        cx += 5 * px + gap;
      }
      return cx - gap - x;
    },
    png() {
      // Each scanline is prefixed with filter type 0 (none).
      const raw = Buffer.alloc(h * (w * 3 + 1));
      for (let y = 0; y < h; y++) {
        raw[y * (w * 3 + 1)] = 0;
        px.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
      }
      const ihdr = Buffer.alloc(13);
      ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
      ihdr[8] = 8;   // bit depth
      ihdr[9] = 2;   // colour type: truecolour
      return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", ihdr),
        chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
        chunk("IEND", Buffer.alloc(0)),
      ]);
    },
  };
}

/* The mark is the logo carpenter's square, scaled up, over the site background. */
function ogImage() {
  const ACCENT = [0xc2, 0x41, 0x0c];
  const BG = [0xf7, 0xf6, 0xf2];
  const INK = [0x1a, 0x1a, 0x1a];
  const c = canvas(W, H, BG);

  // Carpenter's square: a thick L, matching the favicon geometry.
  const s = 46, ox = 150, oy = 120;
  c.rect(ox, oy, s * 1.6, s * 6.4, ACCENT);            // vertical leg
  c.rect(ox, oy + s * 4.8, s * 6.4, s * 1.6, ACCENT);  // horizontal leg

  // Ruler ticks cut out of the legs.
  for (let i = 1; i <= 4; i++) { c.rect(ox + s * 0.35, oy + s * i, s * 0.5, 7, BG); }
  for (let i = 2; i <= 5; i++) { c.rect(ox + s * i, oy + s * 5.55, 7, s * 0.5, BG); }

  // Wordmark, stacked, with a rule under it in the accent colour.
  c.text("RULER", 560, 226, 13, 11, INK);
  c.text("SQUARE", 560, 330, 13, 11, INK);
  c.text("CONSTRUCTION CALCULATORS", 562, 446, 4, 4, ACCENT);

  // Footer band.
  c.rect(0, H - 14, W, 14, ACCENT);
  return c.png();
}

/* Square raster mark for Google Search, bookmarks and home screens. Google
 * Search does not list SVG among its supported favicon formats, and its
 * recommended dimensions are multiples of 48px. */
function faviconImage(size = 192) {
  const ACCENT = [0xc2, 0x41, 0x0c];
  const BG = [0xf7, 0xf6, 0xf2];
  const c = canvas(size, size, BG);
  const u = size / 32;

  c.rect(4 * u, 4 * u, 7 * u, 24 * u, ACCENT);
  c.rect(4 * u, 21 * u, 24 * u, 7 * u, ACCENT);
  // Light ruler ticks, matching the inline SVG mark.
  for (const y of [8, 12, 16]) { c.rect(8 * u, y * u, 2 * u, 1.6 * u, BG); }
  for (const x of [14, 18, 22]) { c.rect(x * u, 24 * u, 1.6 * u, 2 * u, BG); }
  return c.png();
}

module.exports = { ogImage, faviconImage };
