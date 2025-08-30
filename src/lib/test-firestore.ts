import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRtePKFmrnmxjii31HqSkPtrFeMAMem3U",
  authDomain: "homesell-photography-562f2.firebaseapp.com",
  projectId: "homesell-photography-562f2",
  storageBucket: "homesell-photography-562f2.firebasestorage.app",
  messagingSenderId: "922897935847",
  appId: "1:922897935847:web:4bb6e114221252b9f22142",
  measurementId: "G-JF45C5BX0S"
};

async function testFirestore() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    
    console.log('Getting Firestore instance...');
    const db = getFirestore(app);
    
    console.log('Getting sites collection...');
    const sitesRef = collection(db, 'sites');
    
    console.log('Fetching documents...');
    const snapshot = await getDocs(sitesRef);
    
    console.log('Documents found:', snapshot.size);
    snapshot.forEach((doc) => {
      console.log('Document ID:', doc.id);
    });
  } catch (error) {
    console.error('Error in test:', error);
    if (error instanceof Error) {
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    }
  }
}

testFirestore();

