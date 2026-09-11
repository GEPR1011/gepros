export type GlobePlace = {
  id: string;
  lat: number;
  lon: number;
  name: string;
  note?: string;
};

export type GlobeLocation = {
  city: string;
  country: string;
  highlights?: string[];
  id: string;
  lat: number;
  lon: number;
  period?: string;
  places?: GlobePlace[];
  role?: string;
  stack?: string[];
  summary?: string;
};

/** A titled block of bullets, for describing a project in depth. */
export type GlobeSection = {
  items: string[];
  title: string;
};

export type GlobeProject = {
  highlights?: string[];
  id: string;
  name: string;
  period?: string;
  role?: string;
  sections?: GlobeSection[];
  stack?: string[];
  summary?: string;
  tagline?: string;
  url?: string;
};

export type GlobeOrbit = {
  label?: string;
  name: string;
  projects: GlobeProject[];
  summary?: string;
};

export type GlobeData = {
  locations: GlobeLocation[];
  orbit?: GlobeOrbit;
  subtitle?: string;
  title?: string;
};

/** Flat `[lon, lat, lon, lat, ...]` rings, from Natural Earth 110m land. */
export type LandRings = number[][];
