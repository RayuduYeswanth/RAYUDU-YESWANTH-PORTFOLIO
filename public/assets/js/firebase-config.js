const firebaseConfig = {
  apiKey: "AIzaSyDUvCL7m81UmuXIKTsRnBRhhzm9IWmHH8s",
  authDomain: "rayudu-yaswanth-portfolio.firebaseapp.com",
  projectId: "rayudu-yaswanth-portfolio",
  storageBucket: "rayudu-yaswanth-portfolio.firebasestorage.app",
  messagingSenderId: "449423514995",
  appId: "1:449423514995:web:12623b876f53198edbf906",
  measurementId: "G-TM2XM573L3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
// storage only loaded in admin (storage SDK script tag present there)
const storage = (typeof firebase.storage !== 'undefined') ? firebase.storage() : null;

// Image uploads → ImgBB
const IMGBB_KEY = "4f8dbfd91fbd17c13e1c5fc36b89b2fa";

async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("key", IMGBB_KEY);
  form.append("image", file);
  const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "ImgBB upload failed");
  return json.data.url;
}
