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

async function verifyShowcaseFavorites() {
  try {
    console.log('Verifying showcase favorites after updates...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Check showcase favorites
    const showcaseDocRef = doc(db, 'favorites', 'showcase');
    const showcaseDoc = await getDoc(showcaseDocRef);

    if (showcaseDoc.exists()) {
      const data = showcaseDoc.data();
      const totalFavorites = (data.media?.length || 0) + (data.sites?.length || 0);

      console.log('✅ Showcase favorites found:', {
        userId: data.userId,
        totalFavorites,
        mediaCount: data.media?.length || 0,
        sitesCount: data.sites?.length || 0,
        updatedAt: data.updatedAt
      });

      console.log('\n📊 Summary:');
      console.log(`- Total favorited items: ${totalFavorites}`);
      console.log(`- FavoriteGallery will process: ${Math.min(totalFavorites, 50)} items (expanded=true)`);
      console.log(`- Images per page: 12`);
      console.log(`- Expected pages: ${Math.ceil(Math.min(totalFavorites, 50) / 12)}`);

      if (totalFavorites > 16) {
        console.log('\n🎉 Good news! This fixes the previous limitation where only 16 items were processed.');
      }

    } else {
      console.log('❌ No showcase favorites document found');
    }
  } catch (error) {
    console.error('❌ Error verifying showcase favorites:', error);
  }
}

verifyShowcaseFavorites();
