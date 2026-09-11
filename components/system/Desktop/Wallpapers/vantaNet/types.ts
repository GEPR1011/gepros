export type VantaNetConfig = {
  backgroundColor: string;
  color: string;
  forceAnimate?: boolean;
  gyroControls?: boolean;
  maxDistance: number;
  mouseControls?: boolean;
  mouseEase?: boolean;
  points: number;
  showDots: boolean;
  spacing: number;
  speed: number;
  touchControls?: boolean;
};

/** The subset of options `useWallpaper` supplies at runtime. */
export type VantaNetRuntimeConfig = Pick<VantaNetConfig, "showDots" | "speed">;

export type VantaNetSettings = VantaNetConfig & {
  THREE?: unknown;
  el: HTMLElement;
};

export type VantaNet = {
  destroy: () => void;
  renderer: {
    setSize: (width: number, height: number) => void;
  };
  resize: () => void;
};
