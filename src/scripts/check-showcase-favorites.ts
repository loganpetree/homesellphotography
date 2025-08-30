import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRtePKFmrnmxjii31HqSkPtrFeMAMem3U",
  authDomain: "homesell-photography-562f2.firebaseapp.com",
  projectId: "homesell-photography-562f2",
  storageBucket: "homesell-photography-562f2.firebasestorage.app",
  messagingSenderId: "922897935847",
  appId: "1:922897935847:web:4bb6e114221252b9f22142",
  measurementId: "G-JF45C5BX0S"
};

async function checkShowcaseFavorites() {
  try {
    console.log('Checking showcase favorites...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Check if showcase favorites document exists
    const showcaseDocRef = doc(db, 'favorites', 'showcase');
    const showcaseDoc = await getDoc(showcaseDocRef);

    if (showcaseDoc.exists()) {
      const data = showcaseDoc.data();
      console.log('Showcase favorites found:', {
        userId: data.userId,
        sitesCount: data.sites?.length || 0,
        mediaCount: data.media?.length || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });

      console.log('Sites:', data.sites || []);
      console.log('Media:', data.media || []);
    } else {
      console.log('No showcase favorites document found');
    }
  } catch (error) {
    console.error('Error checking showcase favorites:', error);
  }
}

checkShowcaseFavorites();
