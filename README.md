# Rayudu Yeswanth — Portfolio

Firebase Auth + Firestore backend · ImgBB image hosting · Vercel deployment.

---

## Stack

| Service | What it does |
|---|---|
| Firebase Auth | Admin login (email/password) |
| Firestore | All content — profile, projects, skills, etc. |
| ImgBB | Free image hosting (profile photo, project images, cert images) |
| Vercel | Static site hosting (free) |
| YouTube | Video embeds (paste URL in project editor) |

Firebase Storage is used **for CV/Resume PDF only** (free 5 GB Spark plan).
Images (photos, projects, certs) go to ImgBB (free, no expiry).

---

## Setup

### 1. Firebase project (already created: `rayudu-yaswanth-portfolio`)

In Firebase Console → your project:

- **Authentication** → Sign-in method → Enable **Email/Password** ✓
- **Firestore** → Create database → production mode → choose a region ✓
- **Storage** → Enable Storage → Start in production mode (used for CV PDF) ✓

### 2. Create your admin user

Firebase Console → **Authentication** → **Users** → **Add user**

Enter your email + a strong password. This is your login for `/admin`.

### 3. Deploy Firestore rules

The Firebase config is already filled in `firebase-config.js`.

To deploy security rules only (no hosting needed):

```bash
npm install -g firebase-tools
firebase login
cd rayudu-portfolio
firebase deploy --only firestore:rules
```

> If you don't deploy rules, Firestore still works — you just use the
> default rules you set in the console.

### 4. Deploy to Vercel

```bash
npm install -g vercel
cd rayudu-portfolio
vercel
```

Vercel auto-detects `vercel.json` → serves `public/` → rewrites `/admin/*` to the SPA.

Or push to GitHub and connect the repo at vercel.com (free, auto-deploys on push).

---

## Seed initial data

After deploying:

1. Visit `https://your-vercel-url.vercel.app/admin`
2. Log in with the admin user you created
3. Click **"⊕ Seed Initial Data"** on the Dashboard
4. All of Rayudu's profile, education, skills, projects, and certifications are written to Firestore

---

## CV / Resume

Go to Admin → **CV / Resume** page. Drag-drop or click to upload a PDF.
It uploads directly to Firebase Storage and the URL is saved to Firestore automatically.
No Google Drive, no copy-pasting.

---

## Image uploads

All images (profile photo, project screenshots, cert scans) are uploaded to **ImgBB** directly from the admin panel. No setup required — the API key is already in `firebase-config.js`.

---

## Project structure

```
rayudu-portfolio/
├── vercel.json              ← Vercel config (outputDir + admin rewrite)
├── firebase.json            ← Firestore rules deploy config
├── firestore.rules
├── firestore.indexes.json
├── storage.rules            ← Not used (kept for reference)
├── .firebaserc
└── public/
    ├── index.html           ← Public portfolio
    ├── admin/
    │   ├── index.html       ← Admin dashboard
    │   └── seed.js          ← Initial data seeder
    └── assets/
        ├── css/
        │   ├── portfolio.css
        │   └── admin.css
        └── js/
            ├── firebase-config.js   ← Config + ImgBB key (already filled)
            ├── portfolio.js
            └── admin.js
```
