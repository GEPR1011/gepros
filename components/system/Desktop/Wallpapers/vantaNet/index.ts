import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import {
  config as vantaConfig,
  disableControls,
} from "components/system/Desktop/Wallpapers/vantaNet/config";
import { type VantaNetRuntimeConfig } from "components/system/Desktop/Wallpapers/vantaNet/types";
import { loadFiles } from "utils/functions";

export const libs = [
  "/System/three.js/three.min.js",
  "/System/Vanta.js/vanta.net.min.js",
];

const vantaNet = (
  el: HTMLElement | null,
  config?: WallpaperConfig,
  fallback?: () => void
): void => {
  const { VANTA: { current: currentEffect } = {} } = window;

  try {
    currentEffect?.destroy();
  } catch {
    // Failed to cleanup effect
  }

  if (!el || typeof WebGLRenderingContext === "undefined") return;

  loadFiles(libs, true).then(() => {
    const { VANTA: { NET } = {} } = window;

    if (NET) {
      try {
        const { showDots, speed } = config as VantaNetRuntimeConfig;

        NET({
          el,
          ...disableControls,
          ...vantaConfig,
          showDots,
          speed: vantaConfig.speed * speed,
        });
        el.querySelector(":scope > canvas")?.setAttribute(
          "aria-hidden",
          "true"
        );
      } catch {
        fallback?.();
      }
    }
  });
};

export default vantaNet;
