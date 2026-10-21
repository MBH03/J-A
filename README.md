# J & A Construction website rebuild

Static rebuild of janda-construction.com (HTML, CSS, JS, no framework). A small Node script assembles the pages.

## Use
```
npm run build         # builds to dist/, images load from the old host's CDN (works for previewing)
npm run serve         # preview dist/ at localhost
npm run images        # run on a machine with normal internet: copies all images into assets/img/
npm run build:local   # builds with images served from /assets/img/ (no dependency on the old host)
```
Deploy the contents of `dist/` to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc).

## Layout
- `src/pages/*.html` page content (front matter sets title, description, share image)
- `src/layout.html` shared header and footer
- `src/css/style.css`, `src/js/main.js`
- `src/gallery.json` gallery photo list
- `build.mjs` builder. Facts that conflict on the live site (`HOURS`, `CONTACT_HOURS`) are constants at the top.
- `FORM_ENDPOINT` env var: set to a form service URL to post the contact form. Left empty it opens an email draft.

## Open items to confirm with James
- "Since 2004" (home page) vs "since 1990" (all other pages)
- Brown accent color (approximated as #6B3F10)
- Testimonial section background, form handling and spam protection, gallery album groupings
- Home page intro photo (currently the hero photo as a stand in)
