import { type DefaultTheme } from "styled-components";
import defaultTheme from "styles/defaultTheme";
import gruvboxTheme from "styles/gruvboxTheme";

const themes = { defaultTheme, gruvboxTheme };

export type ThemeName = keyof typeof themes;

export default themes as Record<ThemeName, DefaultTheme>;
