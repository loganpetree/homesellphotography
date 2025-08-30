export interface FirebaseMedia {
  mediaId: string;
  type: string;
  name: string;
  hidden: boolean;
  highlight: boolean;
  extension: string;
  size: number;
  originalUrl: string;
  storageUrl: string;
  smallUrl?: string;      // Small preview (400px width)
  mediumUrl?: string;     // Medium size (800px width)
  largeUrl?: string;      // Large size (1600px width)
  order: number;
  branded: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseSite {
  siteId: string;
  businessId: string;
  status: 'active' | 'inactive' | 'archived';
  purchased: 'yes' | 'delivery only' | 'no';
  reviewed?: boolean;
  user: {
    userId: string;
    businessId: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'deleted';
    type: 'team-member' | 'group-admin' | 'client' | 'assistant';
    group: {
      groupId: string;
      businessId: string;
      name: string;
      status: string;
    };
    permissions: string[];
  };
  address: string;
  city: string;
  state: string;
  zip: string;
  createdAt: string;
  activatedAt: string;
  updatedAt: string;
  media: FirebaseMedia[];
}

