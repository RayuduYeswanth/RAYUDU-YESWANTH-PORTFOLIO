const ADMIN_EMAIL = 'ryeswanthbraptcy@gmail.com';

// ── Toast ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('admin-toast');
  el.innerHTML = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 4000);
}

// ── Page navigation ──────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  document.querySelector(`[data-page="${name}"]`)?.classList.add('active');
  loaders[name]?.();
}

// ── Auth — email lock ─────────────────────────────────────────────────────────
auth.onAuthStateChanged(async user => {
  if (user) {
    if (user.email !== ADMIN_EMAIL) {
      await auth.signOut();
      showLoginError('Access denied. Only the authorized admin can log in.');
      return;
    }
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('admin-email').textContent = user.email;
    showPage('dashboard');
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

document.getElementById('login-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const emailVal = e.target.email.value.trim();
  if (emailVal !== ADMIN_EMAIL) {
    showLoginError('Access denied. This email is not authorized as admin.');
    return;
  }
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Signing in…';
  showLoginError('');
  try {
    await auth.signInWithEmailAndPassword(emailVal, e.target.password.value);
  } catch (err) {
    showLoginError('Invalid password. Please try again.');
    btn.disabled = false; btn.textContent = 'Sign In';
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut());

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const [projSnap, certSnap, msgSnap, skillSnap] = await Promise.all([
    db.collection('projects').get(),
    db.collection('certifications').get(),
    db.collection('messages').get(),
    db.collection('skills').get()
  ]);
  document.getElementById('dash-projects').textContent = projSnap.size;
  document.getElementById('dash-certs').textContent = certSnap.size;
  document.getElementById('dash-messages').textContent = msgSnap.size;
  document.getElementById('dash-skills').textContent = skillSnap.size;
  updateUnreadBadge(msgSnap.docs.filter(d => !d.data().read).length);

  const recent = await db.collection('messages').orderBy('createdAt', 'desc').limit(5).get();
  const el = document.getElementById('recent-messages');
  if (!el) return;
  if (recent.empty) { el.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">No messages yet.</p>'; return; }
  el.innerHTML = recent.docs.map(d => {
    const m = d.data();
    return `<div style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-bottom:1px solid rgba(30,58,95,.4)">
      ${!m.read ? '<span class="unread-dot"></span>' : '<span style="width:.5rem;display:inline-block"></span>'}
      <div style="flex:1;min-width:0">
        <div style="font-size:.875rem;font-weight:500">${m.name}</div>
        <div style="font-size:.775rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.message}</div>
      </div>
      <div style="font-size:.72rem;color:var(--muted)">${m.email}</div>
    </div>`;
  }).join('');
}

function updateUnreadBadge(count) {
  const badge = document.getElementById('msg-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

// ── Profile ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  const snap = await db.collection('profile').doc('main').get();
  if (!snap.exists) return;
  const p = snap.data();
  const f = id => document.getElementById(id);
  const set = (id, val) => { if (f(id)) f(id).value = val || ''; };
  set('p-name', p.name); set('p-title', p.title); set('p-tagline', p.tagline);
  set('p-bio', p.bio); set('p-email', p.email); set('p-phone', p.phone);
  set('p-location', p.location);
  if (f('p-langs')) f('p-langs').value = (p.languages || []).join(', ');
  set('p-linkedin', (p.socialLinks||{}).linkedin);
  set('p-github',   (p.socialLinks||{}).github);
  set('p-twitter',  (p.socialLinks||{}).twitter);
  set('p-instagram',(p.socialLinks||{}).instagram);
  if (p.profilePhotoURL) {
    const img = f('avatar-preview');
    if (img) { img.src = p.profilePhotoURL; img.style.display = 'block'; }
    const init = f('avatar-initials');
    if (init) init.style.display = 'none';
  }
  // Update CV status display
  const cvStatus = f('cv-status');
  if (cvStatus) {
    cvStatus.innerHTML = p.cvURL
      ? `Current CV: <a href="${p.cvURL}" target="_blank" style="color:var(--accent)">View / Download ↗</a>`
      : 'No CV uploaded yet.';
  }
}

document.getElementById('profile-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    const langs = document.getElementById('p-langs').value.split(',').map(s => s.trim()).filter(Boolean);
    await db.collection('profile').doc('main').set({
      name: document.getElementById('p-name').value.trim(),
      title: document.getElementById('p-title').value.trim(),
      tagline: document.getElementById('p-tagline').value.trim(),
      bio: document.getElementById('p-bio').value.trim(),
      email: document.getElementById('p-email').value.trim(),
      phone: document.getElementById('p-phone').value.trim(),
      location: document.getElementById('p-location').value.trim(),
      languages: langs,
      socialLinks: {
        linkedin: document.getElementById('p-linkedin').value.trim(),
        github:   document.getElementById('p-github').value.trim(),
        twitter:  document.getElementById('p-twitter').value.trim(),
        instagram:document.getElementById('p-instagram').value.trim()
      }
    }, { merge: true });
    toast('Profile saved!');
  } catch (err) { toast('Save failed: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save Profile'; }
});

// Avatar upload → ImgBB
document.getElementById('avatar-upload-btn')?.addEventListener('click', () => document.getElementById('avatar-file').click());
document.getElementById('avatar-file')?.addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  const btn = document.getElementById('avatar-upload-btn');
  btn.style.opacity = '.5';
  try {
    const url = await uploadToImgBB(file);
    await db.collection('profile').doc('main').set({ profilePhotoURL: url }, { merge: true });
    const img = document.getElementById('avatar-preview');
    if (img) { img.src = url; img.style.display = 'block'; }
    const init = document.getElementById('avatar-initials');
    if (init) init.style.display = 'none';
    toast('Photo uploaded!');
  } catch (err) { toast(err.message, 'error'); }
  finally { btn.style.opacity = '1'; }
});

// ── CV Upload — Firebase Storage (free Spark plan) ───────────────────────────
function loadCvUpload() { loadProfile(); }

function setupCvUpload() {
  const zone = document.getElementById('cv-dropzone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); uploadCV(e.dataTransfer.files[0]); });
  zone.addEventListener('click', () => document.getElementById('cv-file').click());
  document.getElementById('cv-file')?.addEventListener('change', e => uploadCV(e.target.files[0]));
}

async function uploadCV(file) {
  if (!file) return;
  if (file.type !== 'application/pdf') { toast('Please select a PDF file', 'error'); return; }
  if (!storage) { toast('Storage not available', 'error'); return; }
  const wrap = document.getElementById('cv-progress-wrap');
  const bar  = document.getElementById('cv-progress');
  if (wrap) wrap.style.display = 'block';
  if (bar) bar.style.width = '0%';

  const ref = storage.ref('cv/resume.pdf');
  const task = ref.put(file, { contentType: 'application/pdf' });

  task.on('state_changed',
    snap => { if (bar) bar.style.width = Math.round((snap.bytesTransferred / snap.totalBytes) * 100) + '%'; },
    err  => { toast(err.message, 'error'); if (wrap) wrap.style.display = 'none'; },
    async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      await db.collection('profile').doc('main').set({ cvURL: url }, { merge: true });
      if (wrap) wrap.style.display = 'none';
      const cvStatus = document.getElementById('cv-status');
      if (cvStatus) cvStatus.innerHTML = `Current CV: <a href="${url}" target="_blank" style="color:var(--accent)">View / Download ↗</a>`;
      // Copy URL button
      const copyBtn = document.getElementById('cv-copy-btn');
      if (copyBtn) { copyBtn.style.display = ''; copyBtn.onclick = () => { navigator.clipboard.writeText(url); toast('URL copied!'); }; }
      toast(`CV uploaded: ${file.name}`);
    }
  );
}

// ── Education ─────────────────────────────────────────────────────────────────
async function loadEducation() {
  const snap = await db.collection('education').orderBy('order').get();
  const tbody = document.getElementById('edu-tbody');
  if (!tbody) return;
  tbody.innerHTML = snap.docs.map(d => {
    const e = d.data();
    return `<tr>
      <td>${e.degree}</td><td>${e.institution}</td><td>${e.year}</td>
      <td><span class="timeline-badge ${e.status==='pursuing'?'badge-pursuing':'badge-completed'}">${e.status}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openEduModal('${d.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('education','${d.id}',loadEducation)">Del</button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted)">No entries.</td></tr>';
}

function openEduModal(id = null) {
  editingId = id;
  document.getElementById('edu-modal').classList.remove('hidden');
  document.getElementById('edu-modal-title').textContent = id ? 'Edit Education' : 'Add Education';
  if (!id) { document.getElementById('edu-form').reset(); return; }
  db.collection('education').doc(id).get().then(d => {
    const e = d.data();
    document.getElementById('edu-degree').value = e.degree || '';
    document.getElementById('edu-institution').value = e.institution || '';
    document.getElementById('edu-year').value = e.year || '';
    document.getElementById('edu-status').value = e.status || 'pursuing';
    document.getElementById('edu-order').value = e.order || 1;
  });
}

document.getElementById('edu-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const data = {
      degree: document.getElementById('edu-degree').value.trim(),
      institution: document.getElementById('edu-institution').value.trim(),
      year: document.getElementById('edu-year').value.trim(),
      status: document.getElementById('edu-status').value,
      order: Number(document.getElementById('edu-order').value)
    };
    if (editingId) await db.collection('education').doc(editingId).set(data);
    else await db.collection('education').add(data);
    document.getElementById('edu-modal').classList.add('hidden');
    loadEducation(); toast('Education saved!');
  } catch (err) { toast(err.message, 'error'); }
});

// ── Projects ─────────────────────────────────────────────────────────────────
async function loadProjects() {
  const snap = await db.collection('projects').orderBy('order').get();
  const el = document.getElementById('projects-list');
  if (!el) return;
  el.innerHTML = snap.docs.map(d => {
    const p = d.data();
    const date = p.createdAt ? new Date(p.createdAt.toDate()).toLocaleDateString() : '';
    return `<div class="card" style="padding:1rem;display:flex;align-items:center;gap:1rem;margin-bottom:.75rem">
      ${p.imageURLs?.[0] ? `<img src="${p.imageURLs[0]}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">` :
        '<div style="width:60px;height:60px;background:var(--bg);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem">⟨/⟩</div>'}
      <div style="flex:1">
        <div style="font-weight:600;font-size:.9rem">${p.title}</div>
        <div style="font-size:.775rem;color:var(--muted)">${p.category||''} ${date?'· '+date:''}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="openProjModal('${d.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteItem('projects','${d.id}',loadProjects)">Del</button>
    </div>`;
  }).join('') || '<p style="color:var(--muted);text-align:center;padding:2rem">No projects yet.</p>';
}

let projTags = [];
let editingId = null;

function openProjModal(id = null) {
  editingId = id; projTags = [];
  document.getElementById('proj-modal').classList.remove('hidden');
  document.getElementById('proj-modal-title').textContent = id ? 'Edit Project' : 'Add Project';
  document.getElementById('proj-form').reset();
  document.getElementById('proj-existing-imgs').innerHTML = '';
  renderTagsUI();
  if (!id) return;
  db.collection('projects').doc(id).get().then(d => {
    const p = d.data();
    document.getElementById('proj-title').value = p.title || '';
    document.getElementById('proj-desc').value = p.description || '';
    document.getElementById('proj-category').value = p.category || '';
    document.getElementById('proj-github').value = p.githubURL || '';
    document.getElementById('proj-demo').value = p.demoURL || '';
    document.getElementById('proj-video').value = p.videoURL || '';
    document.getElementById('proj-order').value = p.order || 1;
    projTags = [...(p.techTags||[])]; renderTagsUI();
    if (p.imageURLs?.length) document.getElementById('proj-existing-imgs').innerHTML =
      p.imageURLs.map(u => `<img src="${u}" style="width:60px;height:60px;object-fit:cover;border-radius:6px">`).join('');
  });
}

function renderTagsUI() {
  const container = document.getElementById('tag-container'); if (!container) return;
  container.innerHTML = '';
  projTags.forEach((tag, i) => {
    const span = document.createElement('span'); span.className = 'tag';
    span.innerHTML = `${tag} <span class="tag-remove" data-i="${i}">×</span>`;
    container.appendChild(span);
  });
  const inp = document.createElement('input');
  inp.className = 'tag-input'; inp.placeholder = 'Add tag…';
  inp.addEventListener('keydown', e => {
    if (e.key==='Enter') { e.preventDefault(); const v=inp.value.trim(); if(v){projTags.push(v);renderTagsUI();} }
    if (e.key==='Backspace' && !inp.value && projTags.length) { projTags.pop(); renderTagsUI(); }
  });
  container.appendChild(inp);
  container.addEventListener('click', e => {
    if (e.target.classList.contains('tag-remove')) { projTags.splice(Number(e.target.dataset.i),1); renderTagsUI(); }
    else inp.focus();
  });
}

document.getElementById('proj-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled=true; btn.textContent='Saving…';
  try {
    const docId = editingId || db.collection('projects').doc().id;
    let imageURLs = [];
    if (editingId) { const prev = await db.collection('projects').doc(editingId).get(); imageURLs = prev.data()?.imageURLs||[]; }
    for (const file of document.getElementById('proj-images').files) {
      imageURLs.push(await uploadToImgBB(file));
    }
    await db.collection('projects').doc(docId).set({
      title: document.getElementById('proj-title').value.trim(),
      description: document.getElementById('proj-desc').value.trim(),
      category: document.getElementById('proj-category').value.trim(),
      githubURL: document.getElementById('proj-github').value.trim(),
      demoURL: document.getElementById('proj-demo').value.trim(),
      videoURL: document.getElementById('proj-video').value.trim(),
      order: Number(document.getElementById('proj-order').value),
      techTags: projTags, imageURLs,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    document.getElementById('proj-modal').classList.add('hidden');
    loadProjects(); toast('Project saved!');
  } catch (err) { toast(err.message,'error'); }
  finally { btn.disabled=false; btn.textContent='Save Project'; }
});

// ── Certifications ─────────────────────────────────────────────────────────────
async function loadCertifications() {
  const snap = await db.collection('certifications').orderBy('order').get();
  const el = document.getElementById('certs-list'); if (!el) return;
  el.innerHTML = snap.docs.map(d => {
    const c = d.data();
    return `<div class="card" style="padding:1rem;display:flex;align-items:center;gap:1rem;margin-bottom:.75rem">
      <div class="cert-badge badge-${c.badgeType||'OTHER'}">${c.badgeType||'★'}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:.875rem">${c.title}</div>
      <div style="font-size:.775rem;color:var(--muted)">${c.issuer} · ${c.date}</div></div>
      <button class="btn btn-ghost btn-sm" onclick="openCertModal('${d.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteItem('certifications','${d.id}',loadCertifications)">Del</button>
    </div>`;
  }).join('') || '<p style="color:var(--muted);text-align:center;padding:2rem">No certifications yet.</p>';
}

function openCertModal(id = null) {
  editingId = id;
  document.getElementById('cert-modal').classList.remove('hidden');
  document.getElementById('cert-modal-title').textContent = id ? 'Edit Certification' : 'Add Certification';
  document.getElementById('cert-form').reset();
  document.getElementById('cert-img-preview').innerHTML = '';
  if (!id) return;
  db.collection('certifications').doc(id).get().then(d => {
    const c = d.data();
    document.getElementById('cert-title').value = c.title||'';
    document.getElementById('cert-issuer').value = c.issuer||'';
    document.getElementById('cert-date').value = c.date||'';
    document.getElementById('cert-badge').value = c.badgeType||'OTHER';
    document.getElementById('cert-order').value = c.order||1;
    if (c.imageURL) document.getElementById('cert-img-preview').innerHTML =
      `<img src="${c.imageURL}" style="height:60px;border-radius:6px;margin-top:.5rem">`;
  });
}

document.getElementById('cert-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled=true; btn.textContent='Saving…';
  try {
    const docId = editingId || db.collection('certifications').doc().id;
    let imageURL = '';
    if (editingId) { const prev = await db.collection('certifications').doc(editingId).get(); imageURL=prev.data()?.imageURL||''; }
    const file = document.getElementById('cert-image').files[0];
    if (file) imageURL = await uploadToImgBB(file);
    await db.collection('certifications').doc(docId).set({
      title: document.getElementById('cert-title').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim(),
      date: document.getElementById('cert-date').value.trim(),
      badgeType: document.getElementById('cert-badge').value,
      order: Number(document.getElementById('cert-order').value), imageURL
    }, { merge: true });
    document.getElementById('cert-modal').classList.add('hidden');
    loadCertifications(); toast('Certification saved!');
  } catch (err) { toast(err.message,'error'); }
  finally { btn.disabled=false; btn.textContent='Save'; }
});

// ── Skills ─────────────────────────────────────────────────────────────────────
async function loadSkills() {
  const snap = await db.collection('skills').orderBy('order').get();
  const el = document.getElementById('skills-manager'); if (!el) return;
  el.innerHTML = snap.docs.map(d => {
    const s = d.data();
    return `<div class="skill-group">
      <div class="skill-group-header">
        <span>${s.groupName}</span>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('skills','${d.id}',loadSkills)">Delete Group</button>
      </div>
      <div class="skill-group-body">
        <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.75rem">
          ${(s.items||[]).map((item,i)=>`<span class="skill-chip">${item} <span class="skill-chip-remove" onclick="removeSkillItem('${d.id}',${i})">×</span></span>`).join('')}
        </div>
        <div style="display:flex;gap:.5rem">
          <input class="form-input" id="skill-input-${d.id}" placeholder="New skill…" style="max-width:200px"
            onkeydown="if(event.key==='Enter'){event.preventDefault();addSkillItem('${d.id}');}">
          <button class="btn btn-primary btn-sm" onclick="addSkillItem('${d.id}')">Add</button>
        </div>
      </div>
    </div>`;
  }).join('') || '<p style="color:var(--muted);text-align:center;padding:2rem">No skill groups yet.</p>';
}

async function addSkillItem(docId) {
  const inp = document.getElementById(`skill-input-${docId}`);
  const val = inp.value.trim(); if (!val) return;
  await db.collection('skills').doc(docId).update({ items: firebase.firestore.FieldValue.arrayUnion(val) });
  inp.value=''; loadSkills();
}
async function removeSkillItem(docId, idx) {
  const snap = await db.collection('skills').doc(docId).get();
  const items = [...(snap.data().items||[])]; items.splice(idx,1);
  await db.collection('skills').doc(docId).update({ items }); loadSkills();
}
document.getElementById('add-skill-group')?.addEventListener('click', async () => {
  const name = prompt('Skill group name:'); if (!name) return;
  const snap = await db.collection('skills').orderBy('order','desc').limit(1).get();
  const maxOrder = snap.empty ? 0 : (snap.docs[0].data().order||0);
  await db.collection('skills').add({ groupName: name.trim(), order: maxOrder+1, items: [] });
  loadSkills(); toast('Group added!');
});

// ── Messages ───────────────────────────────────────────────────────────────────
async function loadMessages() {
  const snap = await db.collection('messages').orderBy('createdAt','desc').get();
  const tbody = document.getElementById('msg-tbody'); if (!tbody) return;
  updateUnreadBadge(snap.docs.filter(d=>!d.data().read).length);
  tbody.innerHTML = snap.docs.map(d => {
    const m = d.data();
    const date = m.createdAt ? new Date(m.createdAt.toDate()).toLocaleDateString() : '';
    return `<tr class="msg-row" onclick="openMessage('${d.id}')">
      <td>${!m.read?'<span class="unread-dot"></span> ':''}<span style="font-weight:${m.read?400:600}">${m.name}</span></td>
      <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.message}</td>
      <td>${date}</td>
      <td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteItem('messages','${d.id}',loadMessages)">Del</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:2rem">No messages.</td></tr>';
}

async function openMessage(id) {
  const snap = await db.collection('messages').doc(id).get();
  const m = snap.data();
  document.getElementById('msg-modal').classList.remove('hidden');
  document.getElementById('msg-detail-name').textContent = m.name;
  document.getElementById('msg-detail-email').textContent = m.email;
  document.getElementById('msg-detail-text').textContent = m.message;
  document.getElementById('msg-reply-btn').href = `mailto:${m.email}?subject=Re: Your message`;
  if (!m.read) await db.collection('messages').doc(id).update({ read: true });
  loadMessages();
}

// ── Generic delete ────────────────────────────────────────────────────────────
async function deleteItem(col, id, reload) {
  if (!confirm('Are you sure?')) return;
  await db.collection(col).doc(id).delete();
  reload(); toast('Deleted.');
}

// ── Page loaders map ──────────────────────────────────────────────────────────
const loaders = {
  dashboard:      loadDashboard,
  profile:        loadProfile,
  education:      loadEducation,
  projects:       loadProjects,
  certifications: loadCertifications,
  skills:         loadSkills,
  messages:       loadMessages,
  'cv-upload':    loadCvUpload
};

// ── Wire nav + modals ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-page]').forEach(item =>
  item.addEventListener('click', () => showPage(item.dataset.page))
);
document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn =>
  btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.add('hidden'))
);
document.querySelectorAll('.modal-overlay').forEach(ov =>
  ov.addEventListener('click', e => { if (e.target===ov) ov.classList.add('hidden'); })
);

// ── Seed button ───────────────────────────────────────────────────────────────
document.getElementById('seed-btn')?.addEventListener('click', () => {
  if (!confirm('Write seed data to Firestore?')) return;
  const script = document.createElement('script');
  script.src = 'seed.js';
  document.head.appendChild(script);
  script.onload = () => typeof seedData === 'function' && seedData();
});

// ── Init ─────────────────────────────────────────────────────────────────────
setupCvUpload();
