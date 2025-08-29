'use client';

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

function initializeFirebase() {
  const app = initializeApp(firebaseConfig);
  return {
    storage: getStorage(app),
    db: getFirestore(app)
  };
}

let firebaseInstance: ReturnType<typeof initializeFirebase> | null = null;

export function getFirebaseInstance() {
  if (!firebaseInstance) {
    firebaseInstance = initializeFirebase();
  }
  return firebaseInstance;
}

