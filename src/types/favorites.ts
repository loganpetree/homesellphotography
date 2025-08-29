export interface FavoriteSite {
  siteId: string;
  addedAt: string;
  addedBy: string;
  notes?: string;
}

export interface FavoriteMedia {
  siteId: string;
  mediaId: string;
  addedAt: string;
  addedBy: string;
  notes?: string;
}

export interface FavoritesCollection {
  userId: string;
  sites: FavoriteSite[];
  media: FavoriteMedia[];
  updatedAt: string;
  createdAt: string;
}
