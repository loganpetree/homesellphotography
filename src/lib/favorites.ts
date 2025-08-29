import { db } from './firebase-client';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import type { FavoriteSite, FavoriteMedia, FavoritesCollection } from '@/types/favorites';

const FAVORITES_COLLECTION = 'favorites';

export async function getFavorites(userId: string): Promise<FavoritesCollection | null> {
  const docRef = doc(db, FAVORITES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as FavoritesCollection;
  }
  
  return null;
}

export async function toggleFavoriteSite(userId: string, siteId: string, notes?: string): Promise<boolean> {
  const docRef = doc(db, FAVORITES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Create new favorites document
    const newDoc = {
      userId,
      sites: [{
        siteId,
        addedAt: new Date().toISOString(),
        addedBy: userId,
        notes: notes || null
      }],
      media: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, newDoc);
    return true;
  }

  const data = docSnap.data() as FavoritesCollection;
  const isFavorite = data.sites.some(site => site.siteId === siteId);
  
  if (isFavorite) {
    // Remove from favorites
    await updateDoc(docRef, {
      sites: data.sites.filter(site => site.siteId !== siteId),
      updatedAt: serverTimestamp()
    });
    return false;
  } else {
    // Add to favorites
    await updateDoc(docRef, {
      sites: arrayUnion({
        siteId,
        addedAt: new Date().toISOString(),
        addedBy: userId,
        notes: notes || null
      }),
      updatedAt: serverTimestamp()
    });
    return true;
  }
}

export async function toggleFavoriteMedia(
  userId: string, 
  siteId: string, 
  mediaId: string, 
  notes?: string
): Promise<boolean> {
  const docRef = doc(db, FAVORITES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Create new favorites document
    const newDoc = {
      userId,
      sites: [],
      media: [{
        siteId,
        mediaId,
        addedAt: new Date().toISOString(),
        addedBy: userId,
        notes: notes || null
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, newDoc);
    return true;
  }

  const data = docSnap.data() as FavoritesCollection;
  const isFavorite = data.media.some(m => m.mediaId === mediaId && m.siteId === siteId);
  
  if (isFavorite) {
    // Remove from favorites
    await updateDoc(docRef, {
      media: data.media.filter(m => !(m.mediaId === mediaId && m.siteId === siteId)),
      updatedAt: serverTimestamp()
    });
    return false;
  } else {
    // Add to favorites
    await updateDoc(docRef, {
      media: arrayUnion({
        siteId,
        mediaId,
        addedAt: new Date().toISOString(),
        addedBy: userId,
        notes: notes || null
      }),
      updatedAt: serverTimestamp()
    });
    return true;
  }
}

export async function isSiteFavorited(userId: string, siteId: string): Promise<boolean> {
  const favorites = await getFavorites(userId);
  return favorites?.sites.some(site => site.siteId === siteId) ?? false;
}

export async function isMediaFavorited(
  userId: string, 
  siteId: string, 
  mediaId: string
): Promise<boolean> {
  const favorites = await getFavorites(userId);
  return favorites?.media.some(m => m.mediaId === mediaId && m.siteId === siteId) ?? false;
}
