export interface Plot {
  id: number;
  name: string;
  farm_name?: string;
  crop_type?: string;
  has_manager?: boolean;
  coordinates: [number, number][];
  surface_area: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlotName {
  id: number;
  name: string;
}

export interface PlotCenter {
  id: number;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  coordinates: [number, number][];
  surface_area: number | null;
}

export type DrawingMode = 'none' | 'drawing' | 'closed';
