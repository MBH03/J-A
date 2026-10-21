// Static site builder for J & A Construction. No dependencies.
//   node build.mjs                      images load from the live CDN (preview)
//   IMG_BASE=/assets/img/ node build.mjs   images load from dist/assets/img (after `npm run images`)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'dist');

const SITE_URL = (process.env.SITE_URL || 'https://www.janda-construction.com').replace(/\/$/, '');
const IMG_BASE = process.env.IMG_BASE || 'https://cdn.webnamesandnumbers.com/wp-content/uploads/sites/1020/';
// Set when the site lives in a subfolder, e.g. BASE_PATH=/J-A for GitHub Pages project sites.
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
// Leave empty to use a mailto draft. Set to a Formspree style endpoint to post the form.
const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';

// Facts that conflict on the live site. Change them here once James confirms.
const HOURS = 'Mon to Sat 7:00am to 6:00pm<br>Closed Sun';
const CONTACT_HOURS = 'Open 7am to 6pm Monday to Saturday';

const img = (p) => IMG_BASE + p;

const credentials = `<ul class="checks one"><li>BBB</li><li>Certified Kitchen &amp; Bath Remodeler</li><li>Electrical Contractor License</li><li>Certified Lead Renovator</li></ul>`;
const cta = (label = 'Contact Us') => `<div class="btn-row"><a class="btn" href="/contact/">${label}</a></div>`;

const gallery = JSON.parse(readFileSync(join(src, 'gallery.json'), 'utf8'));
const galleryHtml = {
  featured: gallery.featured.map((f) => `<a href="${img(f.src)}" data-lightbox><img src="${img(f.src)}" alt="${f.alt}" loading="lazy"></a>`).join('\n'),
  grid: gallery.grid.map((p, i) => `<a href="${img(p)}" data-lightbox><img src="${img(p)}" alt="J &amp; A Construction project photo ${i + 1}" loading="lazy"></a>`).join('\n'),
};

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing front matter: ${file}`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

function expand(html) {
  return html
    .replaceAll('{{credentials}}', credentials)
    .replace(/\{\{cta(?::([^}]*))?\}\}/g, (_, l) => cta(l || undefined))
    .replaceAll('{{gallery:featured}}', galleryHtml.featured)
    .replaceAll('{{gallery:grid}}', galleryHtml.grid)
    .replaceAll('{{contact_hours}}', CONTACT_HOURS)
    .replaceAll('{{form_endpoint}}', FORM_ENDPOINT)
    .replace(/\{\{img:([^}]+)\}\}/g, (_, p) => img(p));
}

const layout = readFileSync(join(src, 'layout.html'), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const jsonld = (meta, path) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: 'J & A Construction',
  url: SITE_URL + path,
  telephone: '+1-435-592-0680',
  email: 'jameshenrie2006@hotmail.com',
  image: meta.og ? img(meta.og) : undefined,
  address: { '@type': 'PostalAddress', streetAddress: '1005 E Mill Hollow Way', addressLocality: 'Cedar City', addressRegion: 'UT', postalCode: '84721', addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: 37.6734344, longitude: -113.0729133 },
  areaServed: ['Cedar City', 'New Harmony', 'Cedar Mountain', 'Brian Head', 'Parowan', 'Panguitch Lake', 'Enoch', 'Kanarraville', 'Panguitch'].map((n) => ({ '@type': 'City', name: n })),
  sameAs: ['https://www.facebook.com/jandaconstructionut', 'https://www.yelp.com/biz/j-and-a-construction-cedar-city-2'],
  founder: { '@type': 'Person', name: 'James Henrie' },
}).replaceAll('<', '\\u003c');

function render(meta, body, path) {
  let html = layout
    .replace(/\{\{cur:([\w-]+)\}\}/g, (_, s) => (s === meta.slug ? 'aria-current="page"' : ''))
    .replaceAll('{{title}}', esc(meta.title))
    .replaceAll('{{description}}', esc(meta.description || ''))
    .replaceAll('{{og}}', meta.og ? img(meta.og) : img('2024/07/02155203/14109959553950996144.jpg'))
    .replaceAll('{{site_url}}', SITE_URL)
    .replaceAll('{{path}}', path)
    .replaceAll('{{slug}}', meta.slug)
    .replaceAll('{{hours}}', HOURS)
    .replaceAll('{{year}}', String(new Date().getFullYear()))
    .replaceAll('{{jsonld}}', jsonld(meta, path))
    .replaceAll('{{content}}', body);
  html = expand(html);
  return BASE_PATH ? html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`) : html;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(src, 'css'), join(out, 'css'), { recursive: true });
cpSync(join(src, 'js'), join(out, 'js'), { recursive: true });
if (existsSync(join(root, 'assets'))) cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

const urls = [];
for (const f of readdirSync(join(src, 'pages')).filter((n) => n.endsWith('.html')).sort()) {
  const { meta, body } = parse(join(src, 'pages', f));
  const slug = meta.slug;
  const path = slug === 'home' ? '/' : slug === '404' ? '/404.html' : `/${slug}/`;
  const html = render(meta, body, path);
  const dest = slug === 'home' ? join(out, 'index.html') : slug === '404' ? join(out, '404.html') : join(out, slug, 'index.html');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  if (slug !== '404') urls.push(path);
}

writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${urls.length} pages to dist/ (images: ${IMG_BASE})`);
