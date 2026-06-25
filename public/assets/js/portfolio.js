(() => {
  // ── Typewriter ──────────────────────────────────────────────────────────────
  const FALLBACK_ROLES = [
    'VLSI Design Enthusiast',
    'Embedded Systems Developer',
    'ECE Student',
    'Circuit Design Explorer'
  ];
  let roles = [...FALLBACK_ROLES];
  let roleIdx = 0, charIdx = 0, deleting = false;

  function typeStep() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;
    const role = roles[roleIdx % roles.length];
    if (!deleting) {
      el.textContent = role.slice(0, ++charIdx);
      if (charIdx === role.length) { deleting = true; setTimeout(typeStep, 1800); return; }
    } else {
      el.textContent = role.slice(0, --charIdx);
      if (charIdx === 0) { deleting = false; roleIdx++; }
    }
    setTimeout(typeStep, deleting ? 50 : 80);
  }

  // ── Nav scroll ──────────────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    // active link highlight
    document.querySelectorAll('section[id]').forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top && window.scrollY < top + sec.offsetHeight) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === sec.id));
      }
    });
  });

  // ── Intersection observer for fade-in ──────────────────────────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // ── Toast ───────────────────────────────────────────────────────────────────
  function showToast(msg, ok = true) {
    const t = document.getElementById('toast');
    t.textContent = (ok ? '✓ ' : '✗ ') + msg;
    t.style.borderColor = ok ? 'var(--accent)' : '#ef4444';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  // ── Skeleton helpers ────────────────────────────────────────────────────────
  function skeletonLine(w = '100%', h = '1rem') {
    return `<div class="skeleton" style="width:${w};height:${h};margin-bottom:.5rem"></div>`;
  }

  // ── Render helpers ──────────────────────────────────────────────────────────
  function renderProfile(p) {
    // Name
    document.querySelectorAll('[data-field="name"]').forEach(el => el.textContent = p.name || '');
    // Tagline
    const tg = document.getElementById('hero-tagline');
    if (tg) tg.textContent = p.tagline || '';
    // Bio
    const bio = document.getElementById('bio-text');
    if (bio) bio.textContent = p.bio || '';
    // Contact
    const em = document.getElementById('contact-email');
    if (em) { em.textContent = p.email || ''; em.href = `mailto:${p.email}`; }
    const ph = document.getElementById('contact-phone');
    if (ph) { ph.textContent = p.phone || ''; ph.href = `tel:${p.phone}`; }
    const loc = document.getElementById('contact-location');
    if (loc) loc.textContent = p.location || '';
    // Languages
    const langEl = document.getElementById('languages');
    if (langEl && p.languages) {
      langEl.innerHTML = p.languages.map(l => `<span class="skill-pill">${l}</span>`).join('');
    }
    // Social links
    const sl = p.socialLinks || {};
    ['linkedin','github','twitter','instagram'].forEach(net => {
      const a = document.getElementById(`social-${net}`);
      if (a) {
        if (sl[net]) { a.href = sl[net]; a.style.display = ''; }
        else a.style.display = 'none';
      }
    });
    // Photo
    const img = document.getElementById('profile-img');
    const initials = document.getElementById('profile-initials');
    if (p.profilePhotoURL && img) {
      img.src = p.profilePhotoURL; img.style.display = 'block';
      if (initials) initials.style.display = 'none';
    }
    // CV
    const cvBtn = document.getElementById('cv-btn');
    if (cvBtn) {
      if (p.cvURL) { cvBtn.href = p.cvURL; cvBtn.removeAttribute('disabled'); cvBtn.title = ''; }
      else { cvBtn.removeAttribute('href'); cvBtn.setAttribute('disabled', ''); cvBtn.title = 'CV Coming Soon'; }
    }
    // Typewriter: inject profile title as first role
    if (p.title) roles = [p.title, ...FALLBACK_ROLES];
  }

  function renderEducation(docs) {
    const el = document.getElementById('education-list');
    if (!el) return;
    el.innerHTML = docs.map(d => `
      <div class="timeline-item fade-in">
        <div class="timeline-dot"></div>
        <div style="margin-bottom:.25rem">
          <span class="timeline-badge ${d.status === 'pursuing' ? 'badge-pursuing' : 'badge-completed'}">
            ${d.status === 'pursuing' ? 'Pursuing' : 'Completed'}
          </span>
        </div>
        <div style="font-size:1.05rem;font-weight:600;margin-bottom:.2rem">${d.degree}</div>
        <div style="color:var(--accent);font-size:.875rem;margin-bottom:.15rem">${d.institution}</div>
        <div style="color:var(--muted);font-size:.8rem">${d.year}</div>
      </div>
    `).join('');
    el.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  }

  function renderSkills(docs) {
    const el = document.getElementById('skills-grid');
    if (!el) return;
    el.innerHTML = docs.map(d => `
      <div class="card p-5 fade-in">
        <div style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin-bottom:.75rem">
          ${d.groupName}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">
          ${(d.items || []).map(s => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  }

  let allProjects = [];
  function renderProjects(docs) {
    allProjects = docs;
    // Build filter tabs
    const cats = ['All', ...new Set(docs.map(d => d.category).filter(Boolean))];
    const tabsEl = document.getElementById('project-tabs');
    if (tabsEl) {
      tabsEl.innerHTML = cats.map((c, i) =>
        `<button class="filter-tab ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
      ).join('');
      tabsEl.addEventListener('click', e => {
        const btn = e.target.closest('.filter-tab');
        if (!btn) return;
        tabsEl.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects(btn.dataset.cat);
      });
    }
    filterProjects('All');
  }

  function filterProjects(cat) {
    const el = document.getElementById('projects-grid');
    if (!el) return;
    const filtered = cat === 'All' ? allProjects : allProjects.filter(d => d.category === cat);
    el.innerHTML = filtered.map(d => `
      <div class="card project-card fade-in">
        <div class="project-img" style="${d.imageURLs && d.imageURLs[0] ? `background:url(${d.imageURLs[0]}) center/cover;` : ''}">
          ${!d.imageURLs || !d.imageURLs[0] ? `<span>📷 ${d.category || 'Project'}</span>` : ''}
        </div>
        <div style="padding:1.25rem">
          <div style="font-size:.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem">${d.category || ''}</div>
          <div style="font-weight:600;font-size:1rem;margin-bottom:.5rem">${d.title}</div>
          <div style="font-size:.85rem;color:var(--muted);margin-bottom:.875rem;line-height:1.5">${d.description || ''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.875rem">
            ${(d.techTags || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <div style="display:flex;gap:.75rem">
            ${d.githubURL ? `<a href="${d.githubURL}" target="_blank" style="font-size:.8rem;color:var(--accent);text-decoration:none">⟨/⟩ Code</a>` : ''}
            ${d.demoURL ? `<a href="${d.demoURL}" target="_blank" style="font-size:.8rem;color:var(--muted);text-decoration:none">↗ Demo</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  }

  function renderCertifications(docs) {
    const el = document.getElementById('certs-grid');
    if (!el) return;
    el.innerHTML = docs.map(d => `
      <div class="card fade-in" style="padding:1.25rem;display:flex;gap:1rem">
        <div class="cert-badge badge-${d.badgeType || 'OTHER'}">${d.badgeType || '★'}</div>
        <div>
          <div style="font-weight:600;font-size:.9rem;margin-bottom:.2rem">${d.title}</div>
          <div style="color:var(--accent);font-size:.8rem;margin-bottom:.15rem">${d.issuer}</div>
          <div style="color:var(--muted);font-size:.75rem">${d.date}</div>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  }

  function updateStats(counts) {
    Object.entries(counts).forEach(([k, v]) => {
      const el = document.getElementById(`stat-${k}`);
      if (el) el.textContent = v;
    });
  }

  // ── Contact form ─────────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        message: contactForm.message.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      try {
        await db.collection('messages').add(data);
        showToast('Message sent! I\'ll get back to you soon.');
        contactForm.reset();
      } catch {
        showToast('Failed to send. Please email directly.', false);
      } finally {
        btn.disabled = false; btn.textContent = 'Send Message';
      }
    });
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  async function boot() {
    typeStep();

    // Parallel reads
    const [profileSnap, eduSnap, skillsSnap, projSnap, certSnap] = await Promise.all([
      db.collection('profile').doc('main').get(),
      db.collection('education').orderBy('order').get(),
      db.collection('skills').orderBy('order').get(),
      db.collection('projects').orderBy('order').get(),
      db.collection('certifications').orderBy('order').get()
    ]).catch(() => []);

    if (profileSnap && profileSnap.exists) renderProfile(profileSnap.data());
    if (eduSnap) renderEducation(eduSnap.docs.map(d => d.data()));
    if (skillsSnap) renderSkills(skillsSnap.docs.map(d => d.data()));
    if (projSnap) renderProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    if (certSnap) renderCertifications(certSnap.docs.map(d => d.data()));

    // Stats
    const counts = {
      projects: projSnap ? projSnap.size : 0,
      skills: skillsSnap ? skillsSnap.docs.reduce((n, d) => n + (d.data().items || []).length, 0) : 0,
      certs: certSnap ? certSnap.size : 0
    };
    updateStats(counts);
  }

  boot().catch(console.error);
})();
