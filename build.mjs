// Static site builder for J&A Construction. No dependencies.
//   node build.mjs   images load from /assets/img/ (copied into dist/assets/img)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'dist');

const SITE_URL = (process.env.SITE_URL || 'https://www.janda-construction.com').replace(/\/$/, '');
const IMG_BASE = process.env.IMG_BASE || '/assets/img/';
// Set when the site lives in a subfolder, e.g. BASE_PATH=/J-A for GitHub Pages project sites.
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
// Leave empty to use a mailto draft. Set to a Formspree style endpoint to post the form.
const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';

// Facts that conflict on the live site. Change them here once James confirms.
const HOURS = 'Mon to Sat 7:00am to 6:00pm<br>Closed Sun';
const CONTACT_HOURS = 'Open 7am to 6pm Monday to Saturday';

const img = (p) => IMG_BASE + p;
// Absolute address for share tags and structured data
const absImg = (p) => (/^https?:/.test(IMG_BASE) ? IMG_BASE + p : SITE_URL + IMG_BASE + p);

const credentials = `<ul class="checks one"><li>BBB</li><li>Certified Kitchen &amp; Bath Remodeler</li><li>Electrical Contractor License</li><li>Certified Lead Renovator</li></ul>`;
const cta = (label = 'Contact Us') => `<div class="btn-row"><a class="btn" href="/contact/">${label}</a></div>`;

const gallery = JSON.parse(readFileSync(join(src, 'gallery.json'), 'utf8'));
const baSlider = (p) => `<figure class="ba-card">
  <h3>${p.title}: Before and After</h3>
  <p>${p.summary}</p>
  <div class="ba-slider" style="--pos:50%">
    <img class="ba-after" src="${img(p.after)}" alt="${p.afterAlt}" loading="lazy">
    <img class="ba-before" src="${img(p.before)}" alt="${p.beforeAlt}" loading="lazy">
    <span class="ba-label ba-label-before" aria-hidden="true">Before</span>
    <span class="ba-label ba-label-after" aria-hidden="true">After</span>
    <span class="ba-handle" aria-hidden="true"></span>
    <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after: ${p.title}">
  </div>
  <div class="ba-pair">
    <a href="${img(p.before)}" data-lightbox><img src="${img(p.before)}" alt="${p.beforeAlt}" loading="lazy"><b>Before</b></a>
    <a href="${img(p.after)}" data-lightbox><img src="${img(p.after)}" alt="${p.afterAlt}" loading="lazy"><b>After</b></a>
  </div>
</figure>`;
const setHtml = (set, i) => `<section class="section${set.id === 'master-bathroom' ? ' tint' : ''}" id="${set.id}">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Project 0${i + 2}</span>
      <h2>${set.title}</h2>
      <p>${set.summary}</p>
    </div>
    <div class="set-grid ${set.layout}">
${set.photos.map((p) => `      <figure class="set-photo"><a href="${img('gallery/' + p.name + '.jpg')}" data-lightbox><img src="${img('gallery/' + p.name + '-sm.jpg')}" alt="${p.alt}" loading="lazy"></a><figcaption>${p.caption}</figcaption></figure>`).join('\n')}
    </div>
  </div>
</section>`;
const galleryHtml = {
  projects: gallery.projects.map(baSlider).join('\n'),
  sets: gallery.sets.map(setHtml).join('\n\n'),
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
    .replaceAll('{{gallery:projects}}', galleryHtml.projects)
    .replaceAll('{{gallery:sets}}', galleryHtml.sets)
    .replaceAll('{{contact_hours}}', CONTACT_HOURS)
    .replaceAll('{{form_endpoint}}', FORM_ENDPOINT)
    .replace(/\{\{img:([^}]+)\}\}/g, (_, p) => img(p));
}

// Version the stylesheet and script by content so browsers never keep a stale copy
const version = (f) => createHash('sha1').update(readFileSync(join(src, f))).digest('hex').slice(0, 10);
const layout = readFileSync(join(src, 'layout.html'), 'utf8')
  .replace('/css/style.css', `/css/style.css?v=${version('css/style.css')}`)
  .replace('/js/main.js', `/js/main.js?v=${version('js/main.js')}`);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const BUSINESS_ID = SITE_URL + '/#business';
const SERVICE_PAGES = [
  ['Siding installation and replacement', '/siding/'],
  ['Gutter installation and replacement', '/gutters-in-cedar-city-ut/'],
  ['Home remodeling', '/home-remodeling-in-cedar-city-ut/'],
  ['Kitchen remodeling', '/kitchen-remodeling-in-cedar-city-ut/'],
  ['Bathroom remodeling', '/bathroom-remodeling-in-cedar-city-ut/'],
  ['Basement finishing', '/basement-finishing-in-cedar-city-ut/'],
  ['Home additions', '/home-additions-in-cedar-city-ut/'],
  ['Custom home building', '/custom-home-builder-in-cedar-city-ut/'],
];
const AREAS = ['Cedar City', 'New Harmony', 'Cedar Mountain', 'Brian Head', 'Parowan', 'Panguitch Lake', 'Panguitch', 'Enoch', 'Kanarraville'];
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&#8209;/g, '-').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function faqsFrom(body) {
  return [...body.matchAll(/<details class="faq"><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map((m) => ({ '@type': 'Question', name: decode(m[1]), acceptedAnswer: { '@type': 'Answer', text: decode(m[2]) } }));
}

const jsonld = (meta, path, body) => {
  const graph = [{
    '@type': ['GeneralContractor', 'HomeAndConstructionBusiness'],
    '@id': BUSINESS_ID,
    name: 'J and A Construction',
    alternateName: ['J&A Construction', 'J & A Construction', 'JandA Construction', 'J-A Construction', 'J and A Construction Cedar City'],
    url: SITE_URL + '/',
    telephone: '+1-435-592-0680',
    email: 'jameshenrie2006@hotmail.com',
    logo: absImg('2024/07/02145514/logo.png'),
    image: absImg('gallery/hero-1.jpg'),
    description: 'General contractor in Cedar City, Utah providing siding, gutters, remodeling, home additions, basement finishing and custom home building across Southern Utah.',
    address: { '@type': 'PostalAddress', streetAddress: '1005 E Mill Hollow Way', addressLocality: 'Cedar City', addressRegion: 'UT', postalCode: '84721', addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: 37.6734344, longitude: -113.0729133 },
    hasMap: 'https://www.google.com/maps/place/J+and+A+Construction/@37.6734344,-113.0729133,17z',
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:00', closes: '18:00' }],
    areaServed: AREAS.map((n) => ({ '@type': 'City', name: n, containedInPlace: { '@type': 'State', name: 'Utah' } })),
    founder: { '@type': 'Person', name: 'James Henrie' },
    sameAs: ['https://maps.google.com/?cid=8438693738409973379', 'https://www.facebook.com/jandaconstructionut', 'https://www.yelp.com/biz/j-and-a-construction-cedar-city-2'],
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Construction services', itemListElement: SERVICE_PAGES.map(([n, u]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n, url: SITE_URL + u } })) },
  }];
  if (meta.slug !== 'home' && meta.slug !== '404') {
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: meta.crumb || decode(meta.title.split('|')[0]), item: SITE_URL + path },
    ] });
  }
  if (meta.service) {
    graph.push({ '@type': 'Service', name: meta.service, serviceType: meta.service, url: SITE_URL + path, provider: { '@id': BUSINESS_ID }, areaServed: AREAS.map((n) => ({ '@type': 'City', name: n })), description: meta.description });
  }
  const faqs = faqsFrom(body);
  if (faqs.length) graph.push({ '@type': 'FAQPage', mainEntity: faqs });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
};

function render(meta, body, path) {
  let html = layout
    .replace(/\{\{cur:([\w-]+)\}\}/g, (_, s) => (s === meta.slug ? 'aria-current="page"' : ''))
    .replaceAll('{{title}}', esc(meta.title))
    .replaceAll('{{description}}', esc(meta.description || ''))
    .replaceAll('{{og}}', meta.og ? absImg(meta.og) : absImg('gallery/hero-1.jpg'))
    .replaceAll('{{site_url}}', SITE_URL)
    .replaceAll('{{path}}', path)
    .replaceAll('{{slug}}', meta.slug)
    .replaceAll('{{hours}}', HOURS)
    .replaceAll('{{year}}', String(new Date().getFullYear()))
    .replaceAll('{{jsonld}}', jsonld(meta, path, body))
    .replaceAll('{{content}}', body);
  html = expand(html);
  if (!BASE_PATH) return html;
  return html
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`)
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE_PATH}/`);
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

writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${urls.length} pages to dist/ (images: ${IMG_BASE})`);
