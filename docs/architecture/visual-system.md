# Visual system (AI Visual Enhancement phase)

Branch: `feature/ai-visual-enhancement`, continuing `feature/consolidation-hardening`.
Visual only — no backend, API, authentication, routing, schema or business-logic change.

## The one thing the brief asked for that is not here

The brief asked for **AI-generated raster illustrations** — photographic-quality banners,
transparent PNGs, Cloudinary transformations. **No image-generation tool exists in this
environment**, so none were generated, and nothing here is AI-generated art.

What shipped instead is hand-authored **vector** artwork in the requested palette, subject
matter and register. That is a different medium with a different trade-off, and it is worth
being explicit about which way each side falls:

|              | Vector (what shipped)                          | Raster (what was asked for)                           |
| ------------ | ---------------------------------------------- | ----------------------------------------------------- |
| Weight       | 17 banners, **48 KB total**                    | one photographic banner alone is typically 150–400 KB |
| Sharpness    | identical at 320px and 1920px                  | needs `srcset` and several renditions per image       |
| Offline PWA  | precaches without thought                      | a real cache-budget decision                          |
| Photorealism | **none** — it is illustration, not photography | the thing actually asked for                          |

So the portal is illustrated, consistently and cheaply, but it does not contain a single
photorealistic image. If photorealism is the requirement, these files are the placeholders to
replace: swap the contents of `frontend/shared/src/assets/images/` and every call site keeps
working, because nothing imports anything but a URL.

## What is here

```
frontend/shared/src/assets/images/
  hero/      village-welcome, gram-panchayat-office, digital-village,
             citizen-services, agriculture, village-development
  events/    republic-day, independence-day, gram-sabha, tree-plantation,
             health-camp, blood-donation, sports, cleaning-drive, village-gathering
  village/   village-entrance, water-tank
```

Plus, as inline React SVG so they paint with the theme tokens: **5 new empty states** (no
results, no downloads, offline, server error, not found) joining the 7 from Phase 3, and **10
module motifs** (complaint, certificate, tax, scheme, event, notice, notification, directory,
village, emergency).

Every banner is built from the same layers — sky gradient, sun, two hill bands, ground, then
the scene — from one palette: `#1E3A8A` → `#3B82F6` with `#F59E0B`. That shared construction,
not a style guide, is what makes them read as one commissioned set.

## Where it is used

| Surface           | Before                       | Now                                                      |
| ----------------- | ---------------------------- | -------------------------------------------------------- |
| Public hero       | flat block of primary colour | village scene (officer's photo still wins when uploaded) |
| Citizen masthead  | same flat block              | same                                                     |
| Event cards       | grey/blue gradient rectangle | artwork picked from the event's own title                |
| Officer dashboard | white page, heading          | panchayat office band — same artwork the citizen sees    |
| Citizen profile   | white rectangle              | village strip above the identity card                    |
| 9 citizen modules | bare `<h1>`                  | branded band with the module's own motif                 |
| Failure screens   | one lucide glyph             | distinct drawings for offline vs server error            |

### Event artwork is matched on the title, in both scripts

`eventArtFor()` reads the event title and returns a bundled URL — a tricolour for Republic Day,
a sapling for a plantation drive, a neutral gathering scene for anything unrecognised. It never
returns undefined, because a blank band is worse than a slightly generic picture.

This is presentation only. Nothing downstream depends on the result and the title beneath still
says what the event is, so a wrong guess costs a slightly off illustration, not a wrong fact.
The ordering trap is tested: `रक्तदान शिबिर` contains both "रक्तदान" and "शिबिर", so the
blood-donation rule has to be reached before the health-camp one.

## The contrast regression this phase caused, and fixed

Putting artwork behind the public hero **broke it**. Compositing the artwork's real pixels over
the hero colour (canvas, not estimation) showed the sun putting a bright patch behind the
heading:

|                                  | Dark theme                                                     | Light theme |
| -------------------------------- | -------------------------------------------------------------- | ----------- |
| Before this phase (flat primary) | 3.17:1 — scraped past large-text AA, failed it for the tagline | 10.36:1     |
| Artwork, no scrim                | **2.15:1 — fails outright**                                    | 3.99:1      |
| Artwork + 45% scrim (shipped)    | **5.00:1**                                                     | **7.56:1**  |

The scrim therefore also fixes a failure that predates this phase. The officer dashboard band
measures 6.81:1 for the heading and 5.05:1 for the date line; module header bands measure
11.5–17.9:1 in both themes.

## Performance

Measured by building the same tree twice — once with this phase stashed, once with it applied:

|                      | Before      | After       | Δ         |
| -------------------- | ----------- | ----------- | --------- |
| Citizen entry chunk  | 335,512 B   | 335,611 B   | **+99 B** |
| Citizen `dist` total | 1,303,784 B | 1,357,085 B | +53,301 B |

Of that 53 KB, 47.6 KB is the 17 banner files, none of which is fetched until a screen shows
one. The entry chunk is flat because both vite configs force `/images/` assets to be emitted as
files:

```js
assetsInlineLimit: (filePath) => (filePath.includes('/images/') ? false : undefined),
```

Without it every banner sat just under Vite's 4 KB inline threshold and was base64'd into the
entry chunk — about 70 KB of pictures downloaded and parsed before the first paint, with
`loading="lazy"` on a data URI meaning nothing at all.

## Accessibility

Every image added is decorative and carries `alt=""` plus `aria-hidden`; the heading beside it
carries the meaning. Verified in the browser: 0 images without an `alt` attribute, 0 broken
images, and nothing from the artwork appearing in the accessibility tree. Tests assert the
silence directly, because a banner that announces itself between a heading and its content is
easy to ship and impossible to see.

`Banner` fixes the aspect ratio before the file arrives, so there is no layout shift. Module
motifs are hidden below `sm`, where a 320px row has no space for a picture, a Marathi heading
and an action button at once.

## Verification

| Check                                    | Result                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 9 citizen routes × 320/375/768/1280/1920 | zero horizontal overflow, exactly one `<h1>` each                                        |
| Officer dashboard                        | zero overflow, one `<h1>`, band contrast 6.81:1                                          |
| All artwork decoded in the browser       | 17/17 load, 0 broken, correct 16:9 intrinsic ratio                                       |
| Event title → artwork                    | `gram-sabha`, `independence-day`, `health-camp` picked correctly from live seeded events |
| Contrast, both themes                    | hero 5.00 / 7.56, module bands 11.5–17.9                                                 |
| `npm run lint`                           | 0 errors, 0 warnings                                                                     |
| `npm test`                               | 453 passing (287 backend, 118 citizen, 48 officer)                                       |
| `npm run test:coverage`                  | 82.11 / 65.01 / 80.98 / 85.02 — above the gate                                           |
| `npm run build`                          | both apps build                                                                          |

## Honest limitations

- **Nothing here is AI-generated**, and nothing here is photographic. See the top of this
  document.
- **No screenshots.** Capture times out in this environment, so all of the above is measured —
  geometry, composited pixels, contrast ratios, the accessibility tree — not looked at. Whether
  the artwork is _good_ is a judgement that needs human eyes.
- **Lazy images could not be observed loading.** The preview tab reports
  `visibilityState: "hidden"`, so native lazy loading never triggers there. Each asset was
  instead proven to decode directly, and one image was forced to `eager` to confirm the real
  in-page `<img>` then loads. The lazy path itself is unobserved.
- **Not built from the brief's list:** service icons (all 18 services keep their lucide set —
  replacing a consistent, themed icon family with hand-drawn ones would have been a regression,
  not an improvement), the school / temple / road / farmer village scenes, and per-module
  photographic backgrounds. Cloudinary transformations are not used because these assets are
  bundled, not uploaded.
- **The officer portal received one banner**, on its dashboard. Its remaining 17 screens are
  tables and forms, where the citizen-side treatment would be decoration on a work surface.
