'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps } from 'firebase/app';
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

interface FirebaseContextType {
  storage: ReturnType<typeof getStorage> | null;
  db: ReturnType<typeof getFirestore> | null;
  isReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  storage: null,
  db: null,
  isReady: false
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseApp, setFirebaseApp] = useState(getApps()[0] || null);
  const [storage, setStorage] = useState<ReturnType<typeof getStorage> | null>(null);
  const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!firebaseApp) {
      const app = initializeApp(firebaseConfig);
      setFirebaseApp(app);
      setStorage(getStorage(app));
      setDb(getFirestore(app));
      setIsReady(true);
    }
  }, [firebaseApp]);

  return (
    <FirebaseContext.Provider value={{ storage, db, isReady }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

