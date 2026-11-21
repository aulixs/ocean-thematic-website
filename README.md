<div align="center">

# 🌊 OCEAN 2026

### An interactive descent into a living, breathing digital ocean

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Five screens. One cursor. One long breath.**

</div>

---

## ✨ About

**OCEAN 2026** is a conceptual landing page — an interactive descent inspired by the work of [Adrien Quechon](https://www.adrienquechon.com). The deeper you scroll, the darker the water gets: from sunlit shallows down to the pitch-black bottom, where a kraken and a treasure chest are waiting for you.

Everything is hand-drawn in inline SVG and animated with pure CSS — no external assets, no libraries, no frameworks.

> Hold. Scroll. Shift. Repeat.

---

## 🎯 Features

| | What's inside |
|---|---|
| 🖱️ **Glowing trail** | A gradient ribbon follows the cursor and gently fades out when you stop. It sits behind the text and never gets in the way of reading. |
| 🌊 **Depth readout** | A counter in the top-left corner shows how far you've descended; the rail and the background change along with it. |
| 🔀 **Parallel Reality** | Hold the left mouse button for ~0.5s and the world flips: all 35 strings, accents, colors, and even the counter logic switch to the other side. |
| 💠 **Liquid lens** | The transition is a pink bloom with a soft ring expanding from the press point — no heavy filters, no lag. |
| 🐟 **Creatures** | The carp, the school, the shark, the kraken, and the chest are animated part by part: fins, tentacles, eyes, and coins move, while the models themselves stay in place. |
| 🫧 **Atmosphere** | Bubbles, film grain, glow, smooth section reveals, and a fully responsive layout. |
| ⚡ **Performance** | The canvas sleeps when idle, layout is only read on resize, and background colors update in quantized steps. |

---

## 🎮 Controls

| Action | Result |
|---|---|
| Move the cursor | Glowing trail follows your pointer |
| Scroll | Descend, darken the water, update the depth counter |
| **Hold LMB ~0.5s** | Enter / exit Parallel Reality |
| **DIVE** button | Slow auto-descent to the bottom |
| **SURFACE** button | Return to the top |
| **BACK TO YOUR OCEAN** button | Restore the original reality and surface |
| Dots on the right | Jump between levels |

**In Parallel Reality:** the counter shows how much depth is **left to the bottom**, the rail fills in reverse, and the final headline becomes:

> **NICE TO MEET YOU AT THE BOTTOM.**

---

## 🧱 Structure

```text
ocean-2026/
├── index.html    — markup, HUD, 5 levels, inline SVG creatures
├── styles.css    — themes, gradients, animations, responsive rules
├── script.js     — trail, hold gesture, reality shift, depth, auto-dive
└── README.md     — this file
```

---

## 🚀 Getting started

No build step and no installation needed. Just open `index.html` in your browser — double-clicking works.

If you prefer a local server:

    python3 -m http.server 4173

Then open `http://localhost:4173`.

> 💡 The linked files in `index.html` use `?v=14` to bust the cache during development. For production you can drop the suffix and keep just `href="styles.css"` and `src="script.js"`.

---

## 🛠️ Stack

HTML5 · CSS3 (custom properties, grid, keyframes, blend modes) · Vanilla JavaScript (Canvas 2D, rAF, IntersectionObserver) · Inline SVG

Zero dependencies, zero bundlers, zero external fonts — just system fonts.

---

## 📄 License

MIT — do whatever you want with it.

<div align="center">

**Made with love for the ocean. 🌊**

</div>
