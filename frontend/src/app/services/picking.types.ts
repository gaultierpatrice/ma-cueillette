export interface Picking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  description?: string;
  imageUrl?: string;
  daysOpen?: string[];
  labels?: string[];
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  harvestSeason?: string;
  type?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  publishedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface PickingWithDistance extends Picking {
  distance?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
