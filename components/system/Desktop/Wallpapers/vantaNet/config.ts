import { type VantaNetConfig } from "components/system/Desktop/Wallpapers/vantaNet/types";

export const config: VantaNetConfig = {
  backgroundColor: "hsl(0, 0%, 16%)",
  color: "#83a598",
  forceAnimate: true,
  maxDistance: 20,
  points: 10,
  showDots: true,
  spacing: 15,
  speed: 1,
};

export const disableControls = {
  gyroControls: false,
  mouseControls: false,
  mouseEase: false,
  touchControls: false,
};
