/**
 * Generate N HEX shades (light -> dark) from a base color.
 * @param {number} length - How many shades to return (>=1)
 * @param {string} baseHex - Base color (e.g. "#3b82f6" or "#09f"). Default gray.
 * @param {[number, number]} lightnessRange - [%light, %dark], default [95, 10]
 * @returns {string[]} HEX shades like ["#eef5ff", "#dbeaff", ...]
 */
function generateHexShades(
  length,
  baseHex = "#808080",
  lightnessRange = [95, 10]
) {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("length must be an integer >= 1");
  }

  const [Lmax, Lmin] =
    lightnessRange[0] >= lightnessRange[1]
      ? lightnessRange
      : [lightnessRange[1], lightnessRange[0]];

  const { h, s } = hexToHsl(baseHex);
  const step = length > 1 ? (Lmax - Lmin) / (length - 1) : 0;

  const shades = [];
  for (let i = 0; i < length; i++) {
    const l = Lmax - i * step;
    shades.push(hslToHex(h, s, l));
  }
  return shades;
}

/* ---------------- helpers (HEX-safe) ---------------- */

function hexToRgb(hex) {
  let h = hex.replace(/^#/, "").trim();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error("Invalid hex color");
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r8, g8, b8) {
  let r = r8 / 255,
    g = g8 / 255,
    b = b8 / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 1);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb(h, sPct, lPct) {
  const s = sPct / 100,
    l = lPct / 100;
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const r = 255 * hue2rgb(p, q, hk + 1 / 3);
  const g = 255 * hue2rgb(p, q, hk);
  const b = 255 * hue2rgb(p, q, hk - 1 / 3);
  return { r, g, b };
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

module.exports = generateHexShades;
