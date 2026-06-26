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

// Image uploads → ImgBB
const IMGBB_KEY = "4f8dbfd91fbd17c13e1c5fc36b89b2fa";

// CV/PDF uploads → Cloudinary (free, 25 GB)
// Create a free account at cloudinary.com, then:
//   1. Copy your Cloud Name from the dashboard
//   2. Settings → Upload → Add upload preset → set to "Unsigned" → save → copy preset name
const CLOUDINARY_CLOUD_NAME = 'dxftew2ob';
const CLOUDINARY_UPLOAD_PRESET = 'my uploads';

async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("key", IMGBB_KEY);
  form.append("image", file);
  const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "ImgBB upload failed");
  return json.data.url;
}

// onProgress(percent) is optional — called with 0–100 during upload
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);
    if (onProgress) {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status === 200) resolve(json.secure_url);
        else reject(new Error(json.error?.message || 'Cloudinary upload failed'));
      } catch { reject(new Error('Unexpected response from Cloudinary')); }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
}
