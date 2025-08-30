import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (same as client but without 'use client')
const firebaseConfig = {
  apiKey: "AIzaSyCRtePKFmrnmxjii31HqSkPtrFeMAMem3U",
  authDomain: "homesell-photography-562f2.firebaseapp.com",
  projectId: "homesell-photography-562f2",
  storageBucket: "homesell-photography-562f2.firebasestorage.app",
  messagingSenderId: "922897935847",
  appId: "1:922897935847:web:4bb6e114221252b9f22142",
  measurementId: "G-JF45C5BX0S"
};

// Initialize Firebase (avoid multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

export { db };

