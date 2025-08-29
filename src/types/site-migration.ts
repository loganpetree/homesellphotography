// HDPhotoHub Interfaces
export interface HDPhotoHubGroup {
  gid: number;
  bid: number;
  name: string;
  status: string;
}

export interface HDPhotoHubUser {
  uid: number;
  bid: number;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'deleted';
  type: 'team-member' | 'group-admin' | 'client' | 'assistant';
  group: HDPhotoHubGroup;
  keyring: string;
}

export interface HDPhotoHubMedia {
  mid: number;
  type: string;
  name: string;
  hidden: boolean;
  highlight: boolean;
  extension: string;
  size: number;
  url: string;
  order: number;
  branded: string;
}

export interface HDPhotoHubSite {
  sid: number;
  bid: number;
  status: 'active' | 'inactive' | 'archived';
  purchased: 'yes' | 'delivery only' | 'no';
  user: HDPhotoHubUser;
  address: string;
  city: string;
  state: string;
  zip: string;
  created: string;
  activated: string;
  media: HDPhotoHubMedia[];
}

// Firebase Storage Structure
export interface FirebaseMedia {
  mediaId: string; // mid from HDPhotoHub
  type: string;
  name: string;
  hidden: boolean;
  highlight: boolean;
  extension: string;
  size: number;
  originalUrl: string; // original HDPhotoHub URL
  storageUrl: string; // Firebase Storage URL
  order: number;
  branded: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseSite {
  siteId: string; // sid from HDPhotoHub
  businessId: string; // bid from HDPhotoHub
  status: 'active' | 'inactive' | 'archived';
  purchased: 'yes' | 'delivery only' | 'no';
  user: {
    userId: string; // uid from HDPhotoHub
    businessId: string; // bid from HDPhotoHub
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'deleted';
    type: 'team-member' | 'group-admin' | 'client' | 'assistant';
    group: {
      groupId: string; // gid from HDPhotoHub
      businessId: string; // bid from HDPhotoHub
      name: string;
      status: string;
    };
    permissions: string[]; // parsed from keyring
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

