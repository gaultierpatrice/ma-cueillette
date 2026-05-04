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
}

export interface PickingWithDistance extends Picking {
  distance?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
