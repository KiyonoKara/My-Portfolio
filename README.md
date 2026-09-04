# My Portfolio

A personal developer portfolio built with Astro and React islands, statically
generated and deployed to GitHub Pages. It has a Japanese, photo-forward
aesthetic inspired by the blue cavern of Otaru, Hokkaido. The site is static, with no forms, no cookies, no trackers, and self-hosted
fonts. The machine-learning demos run only in the browser.

## Stack

- Astro (static output) with React islands for the interactive demos
- Tailwind CSS v4 and shadcn/ui primitives (`src/components/ui`)
- Motion (Framer) for restrained animation
- Recharts for demo charts
- Fonts self-hosted via Fontsource (Bricolage Grotesque, Fraunces, JetBrains Mono)

## Develop

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Running dev should give this link: `http://localhost:4321/My-Portfolio` (with a port that is or close to 4321). Build outputs to `dist/`.

## Editing content

Everything is content-driven. To add or remove items, drop or delete a file.

| What | Where |
| --- | --- |
| Projects and case studies | `src/content/projects/*.mdx` |
| Experience timeline | `src/content/experiences/*.mdx` |
| Hobbies (Studio) | `src/content/hobbies/*.mdx` |
| Identity, contact, nav | `src/config/site.ts` |
| About page data | `src/config/about.ts` |
| Photo gallery | `src/config/photos.ts` |

Each project frontmatter holds `title`, `tagline`, `short_description`,
`description`, `period`, `year`, `role`, `stack`, `tags`, `kind`, `accent`,
`variant`, `cover`, `featured`, and `order`. The optional fields are `demo`,
`repo`, `links`, `image`, and `gallery`. See any file in
`src/content/projects/` for a complete example.

Adding a project means creating a new `.mdx` file. Set `featured` to true to
surface it on the home Featured grid, and set `demo` to embed a live demo on
its case study page.

Set the `draft` flag to true on any entry to hide it.

## Photos

The site is photo-forward. The home hero uses a real photo
(`/photos/otaru_view.jpeg`, set in `src/pages/index.astro`), and the
study-abroad mini galleries read their photos from `src/config/about.ts`.

Project covers come from the `cover` field in each project frontmatter. Most
are on-brand graphics or real screenshots. If you ever need new generated
graphics, run `node scripts/gen-placeholders.mjs`.

Photos go through a build-time optimizer, so there is nothing to resize by
hand. The workflow is in `docs/editing-content.md` under Images.

## Interactive ML demos

Three projects run client-side from small artifacts in `public/demos/`
(committed).

- Kanji Radical Match (precomputed FFNN predictions, `kanji/predictions.json`)
- SNS Sentiment (Logistic Regression weights, `sentiment/lr_model.json`, with
  in-browser bag-of-words and Porter stemming)
- Tabelog (item-item collaborative filtering reimplemented in TS over
  `tabelog/tabelog.json`)

To regenerate the artifacts (only needed if the models or data change), keep
the `Kanji-Radical-Match-AI/`, `SNS-Sentiment-Analysis/`, and
`Tabelog-ML-Project/` folders locally (they are git-ignored) and run the
following

```bash
python3 -m venv venv && source venv/bin/activate
pip install "numpy<2" scikit-learn torch
pnpm export:demos
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. In
the repo Settings, under Pages, set Source to GitHub Actions. The site
publishes at `https://<username>.github.io/My-Portfolio`.

Update the placeholder username in `astro.config.mjs` (`site`).

### Moving to a custom domain later

1. Add `public/CNAME` containing your domain (for example `example.com`).
2. In `astro.config.mjs`, set `site` to `https://example.com` and `base` to `/`.
3. Set the domain in the repo Pages settings and enable HTTPS.

All internal links and demo-data fetches go through `withBase()`, so flipping
`base` is all that is needed.
