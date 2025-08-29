'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXVYpKnCRWXYBQBDqCHnmPJ6lbTcgXKSo",
  authDomain: "homesell-photography.firebaseapp.com",
  projectId: "homesell-photography",
  storageBucket: "homesell-photography.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };