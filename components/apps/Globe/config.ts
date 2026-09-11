import { type GlobeData } from "components/apps/Globe/types";

export const LAND_URL = "/Program Files/Globe/land.json";

/** Editable from inside the OS with any text editor. */
export const DATA_PATH = "/Users/Public/Documents/Travels/locations.json";

export const GLOBE_RADIUS = 1;

export const CAMERA = {
  far: 100,
  /** Where `focus` on a place settles, close enough to reveal sub-places. */
  focusZoom: 2.1,
  fov: 42,
  maxZoom: 6,
  minZoom: 1.5,
  near: 0.01,
  start: 3.9,
};

/** Below this camera distance, sub-places and their labels appear. */
export const PLACE_REVEAL_ZOOM = 2.7;

export const COLORS = {
  land: 0x83a598, // gruvbox bright_blue
  marker: 0xfe8019, // gruvbox bright_orange
  markerActive: 0xfabd2f, // gruvbox bright_yellow
  meridian: 0x504945, // gruvbox bg2
  ocean: 0x32302f, // gruvbox bg0_s
  orbitPlanet: 0xd3869b, // gruvbox bright_purple
  orbitRing: 0xfabd2f, // gruvbox bright_yellow
  place: 0x8ec07c, // gruvbox bright_aqua
};

export const AUTO_ROTATE_SPEED = 0.0009;
export const IDLE_BEFORE_AUTO_ROTATE_MS = 2500;
export const MARKER_SIZE = 0.026;
export const PLACE_SIZE = 0.015;
export const MAX_TILT = Math.PI / 2.2;

/** The remote-work planet: a body that is deliberately off the map. */
export const ORBIT = {
  glitchIntervalMs: 110,
  /** Characters the planet name cycles through. */
  glitchPool: String.raw`▓▒░#@%&*+=<>/\|§¤×÷`,
  /** Zoom range while the planet is the subject. */
  maxZoom: 2.4,
  minZoom: 0.45,
  planetRadius: 0.11,
  position: { x: 1.45, y: 0.7, z: -0.4 },
  ringInner: 0.17,
  ringOuter: 0.235,
  spinSpeed: 0.0035,
  tilt: -1.15,
  /** Camera distance when the planet takes centre stage. Chosen so the ring
   *  spans the same share of the viewport as the globe does at `CAMERA.start`. */
  viewDistance: 0.85,
};

/** Used when `DATA_PATH` is missing or unreadable. */
export const FALLBACK_DATA: GlobeData = {
  locations: [
    {
      city: "Moçambique",
      country: "Tete e Cabo Delgado",
      id: "mocambique",
      lat: -15.5,
      lon: 36.5,
    },
    {
      city: "Brasil",
      country: "Pará, Maranhão e Tocantins",
      id: "brasil",
      lat: -6.5,
      lon: -48.5,
    },
    {
      city: "Colômbia",
      country: "Valle del Cauca",
      id: "colombia",
      lat: 3.45,
      lon: -76.4,
    },
  ],
  subtitle: "Software Engineer + World Traveler",
  title: "Travels",
};
