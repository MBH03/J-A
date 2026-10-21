(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Sticky header shrink
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('.sub-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const li = btn.closest('.has-sub');
    const open = li.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  }));

  // Services carousel
  const car = $('.carousel');
  if (car) {
    const track = $('.track', car);
    const slides = $$('.slide', track);
    const dots = $('.dots', car.parentElement);
    const step = () => slides[0].getBoundingClientRect().width + 22;
    const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
    const pages = () => Math.ceil(slides.length / perView());

    const buildDots = () => {
      dots.innerHTML = '';
      for (let i = 0; i < pages(); i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Show slide group ${i + 1}`);
        b.addEventListener('click', () => track.scrollTo({ left: i * perView() * step() }));
        dots.appendChild(b);
      }
      mark();
    };
    const mark = () => {
      const i = Math.min(pages() - 1, Math.round(track.scrollLeft / (perView() * step())));
      $$('button', dots).forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
    };
    $('.car-btn.prev', car).addEventListener('click', () => track.scrollBy({ left: -step() * perView() }));
    $('.car-btn.next', car).addEventListener('click', () => {
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      end ? track.scrollTo({ left: 0 }) : track.scrollBy({ left: step() * perView() });
    });
    track.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('resize', buildDots);
    buildDots();
  }

  // Gallery lightbox
  const links = $$('[data-lightbox]');
  if (links.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous photo">&#8249;</button><img alt=""><button class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);
    const img = $('img', box);
    let i = 0;
    let opener = null;
    const show = (n) => {
      i = (n + links.length) % links.length;
      img.src = links[i].href;
      img.alt = $('img', links[i])?.alt || '';
    };
    const close = () => { box.classList.remove('open'); img.removeAttribute('src'); opener && opener.focus(); };
    links.forEach((a, n) => a.addEventListener('click', (e) => {
      e.preventDefault();
      opener = a;
      show(n);
      box.classList.add('open');
      $('.lb-close', box).focus();
    }));
    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', () => show(i - 1));
    $('.lb-next', box).addEventListener('click', () => show(i + 1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  // Contact form: posts to data-endpoint when set (Formspree style JSON), else opens a mail draft
  const form = $('form.contact');
  if (form) {
    const note = $('.form-note', form);
    form.addEventListener('submit', async (e) => {
      const endpoint = form.dataset.endpoint;
      const data = new FormData(form);
      if (data.get('website')) { e.preventDefault(); return; } // honeypot
      if (!endpoint) {
        e.preventDefault();
        const body = `Name: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
        location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent('Estimate request from ' + data.get('name'))}&body=${encodeURIComponent(body)}`;
        return;
      }
      e.preventDefault();
      note.textContent = 'Sending...';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        note.textContent = 'Thank you. James will be in touch soon.';
      } catch {
        note.textContent = 'Sorry, that did not send. Please call (435) 592‑0680.';
      }
    });
  }
})();
