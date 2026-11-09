/* ==========================================================================
   Placeholder cover art
   --------------------------------------------------------------------------
   Generates a layered landscape illustration (SVG) for each book from a small
   "scene" description, so the library looks good before real cover images
   exist. When the admin panel lets the owner upload covers, a book with
   `coverImage` will use the image instead.
   ========================================================================== */

const COVER_SCENES = {
  "snow-white": {
    sky: ["#d9f0f7", "#9fd0e3"],
    sun: { x: 0.72, y: 0.2, r: 26, c: "#ffffff", glow: true },
    layers: [
      { c: "#b9deeb", base: 0.42, amp: 70, type: "mountain" },
      { c: "#8dc3d9", base: 0.55, amp: 45, type: "mountain", trees: "#4f8fae" },
      { c: "#eef8fb", base: 0.74, amp: 22, type: "hill" },
    ],
    dots: { c: "#e4574f", n: 9 },
    figure: { c1: "#2f5d86", c2: "#c94b4b" },
  },
  "lighthouse-cat": {
    sky: ["#ffd6b8", "#f19a85"],
    sun: { x: 0.68, y: 0.36, r: 40, c: "#fff3df", glow: true },
    water: { c: "#5d7fa8", y: 0.68 },
    layers: [{ c: "#3d4b69", base: 0.62, amp: 40, type: "cliff" }],
    landmark: "lighthouse",
  },
  "moon-balloon": {
    sky: ["#1b2557", "#45438f"],
    stars: 45,
    sun: { x: 0.36, y: 0.26, r: 58, c: "#f6efd1", glow: true },
    layers: [
      { c: "#30337a", base: 0.7, amp: 30, type: "hill" },
      { c: "#1c1f4f", base: 0.82, amp: 20, type: "hill" },
    ],
    landmark: "balloon",
  },
  "garden-gate": {
    sky: ["#eef7e2", "#c3e3b2"],
    sun: { x: 0.25, y: 0.2, r: 30, c: "#fffbe8", glow: true },
    layers: [
      { c: "#a8d494", base: 0.55, amp: 30, type: "hill", round: "#7fb871" },
      { c: "#79b36a", base: 0.7, amp: 26, type: "hill" },
      { c: "#4a8a4a", base: 0.86, amp: 16, type: "hill" },
    ],
    landmark: "arch",
  },
  "pip-penguin": {
    sky: ["#e9f1fc", "#b5ccef"],
    sun: { x: 0.3, y: 0.24, r: 34, c: "#ffffff", glow: true },
    layers: [
      { c: "#cddcf3", base: 0.48, amp: 80, type: "mountain" },
      { c: "#9fb9e3", base: 0.62, amp: 50, type: "mountain" },
      { c: "#f7fbff", base: 0.8, amp: 14, type: "hill" },
    ],
    landmark: "penguin",
  },
  "rainy-detectives": {
    sky: ["#93a3b6", "#5b6a7f"],
    houses: { c: "#36414f", windows: "#ffd27a", base: 0.9 },
    rain: true,
    layers: [{ c: "#2b333f", base: 0.93, amp: 4, type: "hill" }],
  },
  clockmaker: {
    sky: ["#f6c3cf", "#8d6aa6"],
    sun: { x: 0.5, y: 0.42, r: 70, c: "#ffe2e8", glow: true },
    landmark: "tower",
    houses: { c: "#4a3159", windows: "#ffc9a8", base: 0.88 },
    layers: [{ c: "#3a2547", base: 0.9, amp: 4, type: "hill" }],
  },
  "fox-juniper": {
    sky: ["#ffe7c7", "#f5b787"],
    sun: { x: 0.7, y: 0.25, r: 34, c: "#fff6e6", glow: true },
    layers: [
      { c: "#eaa168", base: 0.5, amp: 40, type: "hill" },
      { c: "#c9703d", base: 0.64, amp: 34, type: "hill", trees: "#7a3a24" },
      { c: "#6e3424", base: 0.82, amp: 18, type: "hill" },
    ],
  },
  "paper-town": {
    sky: ["#f6ecdb", "#e6d3b5"],
    sun: { x: 0.3, y: 0.28, r: 36, c: "#fff9ef", glow: false },
    layers: [
      { c: "#dcc6a4", base: 0.6, amp: 30, type: "hill" },
      { c: "#c3a47c", base: 0.78, amp: 20, type: "hill" },
    ],
    houses: { c: "#8a6a4d", windows: "#f6e3c2", base: 0.9 },
  },
  "dragon-egg": {
    sky: ["#2b1f3f", "#83404f"],
    stars: 25,
    layers: [
      { c: "#46304f", base: 0.5, amp: 90, type: "mountain" },
      { c: "#2a1c33", base: 0.7, amp: 50, type: "mountain" },
    ],
    sun: { x: 0.5, y: 0.8, r: 24, c: "#ffc56b", glow: true, egg: true },
  },
};

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 7);

function coverSVG(bookId) {
  const sc = COVER_SCENES[bookId];
  const W = 300, H = 400;
  if (!sc) return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#555"/></svg>`;
  const rnd = mulberry32(hashStr(bookId));
  const gid = "sky-" + bookId;
  let out = `<defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.sky[0]}"/><stop offset="1" stop-color="${sc.sky[1]}"/></linearGradient>
    <radialGradient id="${gid}-glow"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${gid})"/>`;

  if (sc.stars) {
    for (let i = 0; i < sc.stars; i++) {
      out += `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H * 0.6).toFixed(1)}" r="${(0.6 + rnd() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`;
    }
  }

  if (sc.sun) {
    const { x, y, r, c, glow, egg } = sc.sun;
    if (glow) out += `<circle cx="${x * W}" cy="${y * H}" r="${r * 2.6}" fill="url(#${gid}-glow)"/>`;
    out += egg
      ? `<ellipse cx="${x * W}" cy="${y * H}" rx="${r * 0.8}" ry="${r}" fill="${c}"/>`
      : `<circle cx="${x * W}" cy="${y * H}" r="${r}" fill="${c}"/>`;
  }

  if (sc.landmark === "tower") {
    out += `<rect x="128" y="150" width="44" height="210" fill="#4a3159"/><polygon points="122,150 150,104 178,150" fill="#4a3159"/>
      <circle cx="150" cy="185" r="15" fill="#ffe2e8"/><path d="M150 185 V175 M150 185 h8" stroke="#4a3159" stroke-width="3" stroke-linecap="round"/>`;
  }

  if (sc.water) {
    const wy = sc.water.y * H;
    out += `<rect x="0" y="${wy}" width="${W}" height="${H - wy}" fill="${sc.water.c}"/>`;
    for (let i = 0; i < 14; i++) {
      const lx = rnd() * W, ly = wy + 12 + rnd() * (H - wy - 20);
      out += `<rect x="${lx}" y="${ly}" width="${18 + rnd() * 30}" height="2.5" rx="1.2" fill="#fff" opacity=".25"/>`;
    }
  }

  (sc.layers || []).forEach((L, li) => {
    const pts = ridge(L, rnd, W, H, sc.water ? true : false);
    let d = `M0 ${H} L` + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + ` L${W} ${H} Z`;
    if (L.round) {
      for (let i = 0; i < 6; i++) {
        const tx = rnd() * W, ty = yAt(pts, tx);
        out += `<circle cx="${tx}" cy="${ty - 6}" r="${10 + rnd() * 10}" fill="${L.round}"/>`;
      }
    }
    out += `<path d="${d}" fill="${L.c}"/>`;
    if (L.trees) {
      for (let i = 0; i < 9; i++) {
        const tx = rnd() * W, ty = yAt(pts, tx) + 6, th = 22 + rnd() * 26, tw = th * 0.42;
        out += `<polygon points="${tx - tw},${ty} ${tx},${ty - th} ${tx + tw},${ty}" fill="${L.trees}"/>`;
      }
    }
  });

  if (sc.houses) {
    const { c, windows, base } = sc.houses;
    let x = -10;
    while (x < W) {
      const w = 34 + rnd() * 30, h = 50 + rnd() * 90, by = base * H;
      out += `<rect x="${x}" y="${by - h}" width="${w}" height="${h + 40}" fill="${c}"/>`;
      if (rnd() > 0.5) out += `<polygon points="${x},${by - h} ${x + w / 2},${by - h - 22} ${x + w},${by - h}" fill="${c}"/>`;
      for (let wy = by - h + 12; wy < by - 14; wy += 20) {
        for (let wx = x + 7; wx < x + w - 10; wx += 13) {
          if (rnd() > 0.45) out += `<rect x="${wx}" y="${wy}" width="6" height="8" rx="1" fill="${windows}" opacity=".9"/>`;
        }
      }
      x += w + 2;
    }
  }

  if (sc.landmark === "lighthouse") {
    out += `<g transform="translate(0,-118)"><polygon points="70,250 92,250 98,330 64,330" fill="#f5efe6"/>
      <rect x="66" y="270" width="30" height="10" fill="#d9534f"/><rect x="65" y="298" width="32" height="10" fill="#d9534f"/>
      <rect x="72" y="236" width="18" height="16" fill="#3d4b69"/><circle cx="81" cy="244" r="5" fill="#ffe9a8"/>
      <polygon points="69,236 81,224 93,236" fill="#d9534f"/>
      <polygon points="86,244 300,200 300,290" fill="#fff6d6" opacity=".22"/></g>`;
  }
  if (sc.landmark === "balloon") {
    out += `<path d="M215 228 L212 300" stroke="#e8e3ff" stroke-width="1.5" opacity=".8"/>
      <ellipse cx="215" cy="205" rx="22" ry="27" fill="#ff7a8a"/><ellipse cx="208" cy="197" rx="6" ry="9" fill="#fff" opacity=".35"/>`;
  }
  if (sc.landmark === "arch") {
    out += `<path d="M120 330 V262 a30 30 0 0 1 60 0 V330 Z" fill="#3e6b3b"/>
      <path d="M130 330 V265 a20 20 0 0 1 40 0 V330 Z" fill="#fff6d8" opacity=".85"/>`;
  }
  if (sc.landmark === "penguin") {
    out += `<ellipse cx="200" cy="300" rx="16" ry="24" fill="#1f2a44"/><ellipse cx="200" cy="304" rx="10" ry="17" fill="#fff"/>
      <circle cx="200" cy="278" r="11" fill="#1f2a44"/><circle cx="204" cy="276" r="2" fill="#fff"/><polygon points="209,280 217,282 209,284" fill="#f6a23a"/>`;
  }

  if (sc.figure) {
    const { c1, c2 } = sc.figure;
    out += `<path d="M196 300 q-14 18 -10 46 h22 q2 -28 -6 -46z" fill="${c2}"/>
      <rect x="191" y="296" width="12" height="22" rx="4" fill="${c1}"/><path d="M190 316 h16 l4 30 h-24z" fill="#f5ecd0"/>
      <circle cx="197" cy="288" r="7" fill="#f2d3bd"/><path d="M190 287 a7 7 0 0 1 14 -2 v-3 a7 7 0 0 0 -14 0z" fill="#1d2433"/>`;
  }

  if (sc.dots) {
    for (let i = 0; i < sc.dots.n; i++) {
      const dx = 20 + rnd() * (W - 40), dy = H * 0.76 + rnd() * H * 0.2;
      out += `<circle cx="${dx}" cy="${dy}" r="${5 + rnd() * 4}" fill="${sc.dots.c}"/>`;
    }
  }

  if (sc.rain) {
    for (let i = 0; i < 70; i++) {
      const rx = rnd() * (W + 60), ry = rnd() * H;
      out += `<line x1="${rx}" y1="${ry}" x2="${rx - 8}" y2="${ry + 18}" stroke="#dfe8f2" stroke-width="1.4" opacity=".45"/>`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

function ridge(L, rnd, W, H, cliffLeft) {
  const base = L.base * H;
  const pts = [];
  if (L.type === "cliff") {
    pts.push([0, base - L.amp], [110, base - L.amp + 8], [140, base + 30], [150, H * 0.72]);
    pts.push([W, H * 0.72]);
    return pts;
  }
  const step = L.type === "mountain" ? 38 : 25;
  let i = 0;
  for (let x = -10; x <= W + step; x += step, i++) {
    let y;
    if (L.type === "mountain") y = base - (i % 2 ? L.amp * (0.55 + rnd() * 0.45) : rnd() * L.amp * 0.25);
    else y = base - Math.sin(x / 60 + rnd() * 0.6) * L.amp * 0.5 - rnd() * L.amp * 0.2;
    pts.push([x, y]);
  }
  return pts;
}

function yAt(pts, x) {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0);
    }
  }
  return pts[pts.length - 1][1];
}
