# Rayudu Yeswanth Portfolio — Project Context

## What this is
Full-stack portfolio website for **Rayudu Yeswanth Chandra Sekhar** (ECE student, VLSI & Embedded Systems).
Built with plain HTML + Tailwind CDN + Vanilla JS — no build step, no bundler.

**Live URL:** `https://rayudu-portfolio-plum.vercel.app`
**Admin URL:** `https://rayudu-portfolio-plum.vercel.app/admin`
**GitHub repo:** `https://github.com/RayuduYeswanth/RAYUDU-YESWANTH-PORTFOLIO`

---

## Stack decisions (do not change without asking)

| Concern | Choice | Reason |
|---|---|---|
| Hosting | **Vercel** (free) | Not Firebase Hosting — no money |
| Database | **Firebase Firestore** | Already set up, free Spark plan |
| Auth | **Firebase Auth** email/password | Simple, already configured |
| Images | **ImgBB API** (free, permanent) | No Firebase Storage cost for images |
| CV/Resume PDF | **Firebase Storage** (Spark, 5 GB free) | Direct upload from admin, no Google Drive |
| Videos | **YouTube embed URLs** | User pastes YouTube link in admin |
| Firebase SDK | **Compat v10 via CDN** | No bundler needed; uses `firebase.firestore()` style |

**Never add Firebase Storage for images** — user explicitly chose ImgBB.
**Never add Firebase Hosting config** — user uses Vercel.

---

## Firebase project

- **Project ID:** `rayudu-yaswanth-portfolio`
- **Auth domain:** `rayudu-yaswanth-portfolio.firebaseapp.com`
- **Storage bucket:** `rayudu-yaswanth-portfolio.firebasestorage.app`
- **App ID:** `1:449423514995:web:12623b876f53198edbf906`
- Config lives in: `public/assets/js/firebase-config.js` (already filled with real values)

### Admin account
- **Only allowed email:** `ryeswanthbraptcy@gmail.com`
- This is enforced in TWO places:
  1. Client-side in `admin.js` — login form rejects other emails before Firebase call
  2. Server-side in `firestore.rules` and `storage.rules` — `isAdmin()` function checks `request.auth.token.email`

### Firestore rules status
⚠️ **Rules must be manually pasted into Firebase Console** — the CLI account (`dronicsacademy@gmail.com`) lacks IAM permissions on Rayudu's project.

Go to: Firebase Console → Firestore → Rules → paste contents of `firestore.rules` → Publish.
Same for Storage → Rules → paste `storage.rules` → Publish.

---

## File structure

```
rayudu-portfolio/
├── CLAUDE.md                    ← this file
├── vercel.json                  ← outputDirectory: "public", admin SPA rewrite
├── firebase.json                ← Firestore + Storage rules deploy only (no hosting)
├── firestore.rules              ← email-scoped security rules
├── storage.rules                ← email-scoped, used for CV PDF only
├── .firebaserc                  ← project: rayudu-yaswanth-portfolio
└── public/
    ├── index.html               ← public portfolio (mobile-responsive)
    ├── admin/
    │   ├── index.html           ← admin dashboard (mobile-responsive)
    │   └── seed.js              ← seeds all initial Rayudu data to Firestore
    └── assets/
        ├── css/
        │   ├── portfolio.css    ← dark theme + mobile breakpoints
        │   └── admin.css        ← admin layout + off-canvas sidebar for mobile
        └── js/
            ├── firebase-config.js  ← Firebase init + storage init + uploadToImgBB()
            ├── portfolio.js        ← public site logic (Firestore reads, typewriter, etc.)
            └── admin.js            ← full admin CRUD + auth lock + CV upload + sidebar toggle
```

---

## Firestore collections

| Collection | Doc IDs | Key fields |
|---|---|---|
| `profile` | `main` | name, title, tagline, bio, email, phone, location, profilePhotoURL, cvURL, languages[], socialLinks{} |
| `education` | auto | degree, institution, year, status (pursuing/completed), order |
| `skills` | auto | groupName, order, items[] |
| `projects` | auto | title, description, techTags[], imageURLs[], videoURL (YouTube), githubURL, demoURL, category, order |
| `certifications` | auto | title, issuer, date, badgeType (FPGA/TCAD/AI/NPTEL/OTHER), imageURL, order |
| `messages` | auto | name, email, message, createdAt, read (bool) |
| `settings` | `site` | footerText, analyticsEnabled |

---

## Key code patterns

### firebase-config.js
```js
const storage = (typeof firebase.storage !== 'undefined') ? firebase.storage() : null;
```
`storage` is `null` on the public portfolio (Storage SDK not loaded there — only loaded in admin HTML).

### ImgBB upload (images only)
```js
uploadToImgBB(file)  // defined in firebase-config.js, returns Promise<url>
```
Used for: profile photo, project images, cert images.

### Firebase Storage upload (CV PDF only)
```js
const ref = storage.ref('cv/resume.pdf');
const task = ref.put(file, { contentType: 'application/pdf' });
// on complete → task.snapshot.ref.getDownloadURL()
```
Handled in `admin.js → uploadCV()`.

### Admin email lock (admin.js)
```js
const ADMIN_EMAIL = 'ryeswanthbraptcy@gmail.com';
// Checked in login form submit AND in auth.onAuthStateChanged
```

### Mobile sidebar toggle (admin.js)
```js
toggleSidebar() / closeSidebar()
// Toggles #sidebar.open class + #sidebar-overlay.show class
// Called from hamburger btn in #mobile-topbar
```

---

## Mobile responsiveness

### Portfolio (portfolio.css)
- `<768px`: hamburger replaces nav links, hero stacks to 1 col (avatar on top), about/contact go 1 col
- `<480px`: project grid 1 col, cert grid 1 col, smaller avatar

### Admin (admin.css)
- `<768px`: off-canvas sidebar drawer (translateX -100% → 0), mobile topbar visible, form grids collapse to 1 col, tables scroll horizontally, modals become bottom sheets
- `<480px`: tighter padding, smaller stat cards

---

## Deployment

### Vercel (auto on git push — once GitHub is connected)
```bash
npx vercel --yes --prod
```
`vercel.json` sets `outputDirectory: "public"` and rewrites `/admin/*` → `/admin/index.html`.

### Firebase rules (manual — paste in console OR run when CLI auth is fixed)
```bash
npx firebase-tools login   # must be Rayudu's Google account
firebase deploy --only firestore:rules,storage:rules
```

### GitHub
- Repo: `https://github.com/RayuduYeswanth/RAYUDU-YESWANTH-PORTFOLIO`
- Push account: `satish1247` (added as contributor)
- Branch: `main`

---

## Seed data

Admin → Dashboard → "⊕ Seed Initial Data" writes:
- Profile: Rayudu Yeswanth's details, contact info
- 3 Education entries
- 6 Skill groups (VLSI, EDA, Circuit, Embedded, Programming, Electronics Core)
- 4 Projects (RFID speed control, battery indicator, temp monitor, street light)
- 4 Certifications (TCAD, FPGA, EVOLIX, NPTEL)

Only needs to be run once on a fresh Firestore database.

---

## Known issues / pending

- [ ] Firebase rules not yet live — user must paste manually into Firebase Console (or run `firebase login` with `ryeswanthbraptcy@gmail.com` then `firebase deploy --only firestore:rules,storage:rules`)
- [ ] Firebase Auth user must be created manually: Firebase Console → Authentication → Add user → `ryeswanthbraptcy@gmail.com`
- [ ] Firebase Storage must be enabled: Firebase Console → Storage → Get started → Production mode

---

## Person details (for seed data reference)

- **Name:** Rayudu Yeswanth Chandra Sekhar
- **Email:** ryeswanthbraptcy@gmail.com
- **Phone:** +91 93980 52655
- **Location:** Yanam – 533464, Andhra Pradesh
- **College:** Sri Manakula Vinayagar Engineering College, Puducherry (B.Tech ECE, 2024–2027)
- **Languages:** English, Telugu, Tamil
