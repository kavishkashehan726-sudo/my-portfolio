# Shehan Kavishka — Portfolio

Personal portfolio of **Shehan Kavishka**, full-stack engineer from Hikkaduwa, Sri Lanka.

**Live site:** https://kavishkashehan726-sudo.github.io/my-portfolio/

## Stack

- [Next.js](https://nextjs.org) (App Router, static export) and TypeScript
- Tailwind CSS v4, with light and dark themes via `next-themes`
- GSAP for the intro sequence, Motion for page transitions and reveals
- Lenis smooth scrolling
- HTML canvas and a small hand-written physics engine for the bug hunt game
- GitHub Pages, deployed by GitHub Actions on every push to `main`

## Bug hunt

**Play it:** https://kavishkashehan726-sudo.github.io/my-portfolio/bug-hunt/

A pixel bug roams every page of the site. The **Squash the bug** button in the header leads to its home: a
small game set in my study room.

- Bugs crawl out of a burrow in the wall, fly to the desk and walk toward me while I code.
- Grab a ball from the crate, drop it in the slingshot, pull back and let go. Mid-air hits score double.
- If a bug climbs onto my head, I get hacked: the screen glitches and I break apart into pixels.
- The bulb hanging from the ceiling can be dragged and swung, and it lights the room and casts shadows.
  Tap it to switch the light off, which also switches the site to dark mode.
- Pause with **P** or **Esc**, restart with **R**. Your best score is saved in the browser.

Everything is drawn on a canvas, with no game engine or image files. The balls bounce and roll, the
slingshot band is a spring, and the lamp cord is a swinging chain, all on a small physics loop. The code
lives in [`src/components/bug-hunt`](src/components/bug-hunt).

## Run locally

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Licence

**All rights reserved.** This code is public for viewing only. You may not copy,
modify, reuse, or redeploy it, in whole or in part. See [LICENSE](LICENSE).
