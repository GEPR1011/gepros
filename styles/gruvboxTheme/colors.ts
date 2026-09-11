import type defaultColors from "styles/defaultTheme/colors";

/**
 * Gruvbox dark palette.
 * bg0 #282828 · bg1 #3c3836 · bg2 #504945 · bg3 #665c54
 * fg0 #fbf1c7 · fg4 #a89984 · gray #928374
 * blue #83a598 · green #b8bb26 · red #fb4934 · purple #d3869b · aqua #8ec07c
 */
const colors: typeof defaultColors = {
  background: "#282828",
  fileEntry: {
    background: "hsla(157, 16%, 58%, 25%)",
    backgroundFocused: "hsla(157, 40%, 58%, 35%)",
    backgroundFocusedHover: "hsla(157, 60%, 58%, 30%)",
    border: "hsla(157, 16%, 58%, 30%)",
    borderFocused: "hsla(157, 40%, 58%, 35%)",
    borderFocusedHover: "hsla(157, 60%, 58%, 40%)",
    text: "#FBF1C7",
    textShadow: `
      0 0 1px rgba(29, 32, 33, 75%),
      0 0 2px rgba(29, 32, 33, 50%),

      0 1px 1px rgba(29, 32, 33, 75%),
      0 1px 2px rgba(29, 32, 33, 50%),

      0 2px 1px rgba(29, 32, 33, 75%),
      0 2px 2px rgba(29, 32, 33, 50%)`,
  },
  highlight: "hsla(157, 16%, 58%, 90%)",
  progress: "hsla(61, 66%, 44%, 90%)",
  progressBackground: "hsla(61, 30%, 35%, 70%)",
  progressBarRgb: "rgb(184, 187, 38)",
  selectionHighlight: "hsla(157, 33%, 40%, 90%)",
  selectionHighlightBackground: "hsla(157, 33%, 40%, 30%)",
  taskbar: {
    active: "hsla(20, 6%, 22%, 70%)",
    activeForeground: "hsla(20, 6%, 40%, 70%)",
    ai: {
      balanced: ["rgb(131, 165, 152)", "rgb(69, 133, 136)", "rgb(7, 102, 120)"],
      creative: [
        "rgb(211, 134, 155)",
        "rgb(177, 98, 134)",
        "rgb(143, 63, 113)",
      ],
      precise: ["rgb(142, 192, 124)", "rgb(104, 157, 106)", "rgb(66, 123, 88)"],
    },
    background: "hsla(0, 0%, 12%, 70%)",
    button: {
      color: "#FBF1C7",
    },
    foreground: "hsla(20, 6%, 35%, 70%)",
    foregroundHover: "hsla(20, 6%, 45%, 70%)",
    foregroundProgress: "hsla(61, 30%, 35%, 30%)",
    hover: "hsla(20, 6%, 28%, 70%)",
    peekBorder: "hsla(35, 9%, 52%, 50%)",
  },
  text: "rgba(251, 241, 199, 90%)",
  titleBar: {
    background: "rgb(40, 40, 40)",
    backgroundHover: "rgb(60, 56, 54)",
    backgroundInactive: "rgb(80, 73, 69)",
    buttonInactive: "rgb(146, 131, 116)",
    closeHover: "rgb(251, 73, 52)",
    text: "rgb(251, 241, 199)",
    textInactive: "rgb(168, 153, 132)",
  },
  window: {
    background: "#928374",
    outline: "hsla(20, 6%, 28%, 75%)",
    outlineInactive: "hsla(20, 6%, 33%, 100%)",
    shadow: "0 0 14px 0 rgba(29, 32, 33, 50%)",
    shadowInactive: "0 0 10px 0 rgba(29, 32, 33, 45%)",
  },
};

export default colors;
