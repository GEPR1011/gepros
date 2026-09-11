import styled from "styled-components";

const StyledGlobe = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  font-family: ${({ theme }) => theme.formats.systemFont};
  height: 100%;
  overflow: hidden;
  width: 100%;

  .stage {
    flex: 1;
    min-width: 0;
    position: relative;

    canvas {
      display: block;
      height: 100%;
      touch-action: none;
      width: 100%;
    }
  }

  .labels {
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
  }

  .globe-label {
    color: ${({ theme }) => theme.colors.text};
    font-size: 10px;
    left: 0;
    letter-spacing: 0.02em;
    position: absolute;
    text-shadow:
      0 0 3px rgb(29 32 33 / 90%),
      0 1px 2px rgb(29 32 33 / 90%);
    top: 0;
    white-space: nowrap;

    /* Sits to the right of its dot, vertically centred on it. */
    &.place {
      transform: translate(9px, -50%);
    }

    /* Sits below the planet and its ring, centred. */
    &.orbit {
      color: ${({ theme }) => theme.colors.highlight};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.18em;
      transform: translate(-50%, 0);
    }

    &.active {
      color: #fabd2f;
      font-weight: 600;
    }
  }

  .panel a {
    color: ${({ theme }) => theme.colors.highlight};
    font-size: 12px;
    padding: 7px 9px;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .banner {
    left: 0;
    padding: 12px 16px;
    pointer-events: none;
    position: absolute;
    top: 0;

    h1 {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    p {
      color: ${({ theme }) => theme.colors.highlight};
      font-size: 11px;
      margin-top: 2px;
    }
  }

  .hint {
    bottom: 0;
    color: ${({ theme }) => theme.colors.titleBar.textInactive};
    font-size: 10px;
    left: 0;
    padding: 8px 16px;
    pointer-events: none;
    position: absolute;
  }

  .back {
    align-self: flex-start;
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.window.outline};
    border-radius: 3px;
    color: ${({ theme }) => theme.colors.highlight};
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    margin-bottom: 12px;
    padding: 5px 9px;
    transition: background-color 150ms ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.fileEntry.background};
    }
  }

  .panel {
    background-color: ${({ theme }) => theme.colors.taskbar.background};
    border-left: 1px solid ${({ theme }) => theme.colors.window.outline};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 16px;
    width: 260px;

    h2 {
      font-size: 16px;
      font-weight: 600;
    }

    .country {
      color: ${({ theme }) => theme.colors.highlight};
      font-size: 12px;
      margin-top: 2px;
    }

    .meta {
      color: ${({ theme }) => theme.colors.titleBar.textInactive};
      font-size: 10px;
      margin-top: 10px;
    }

    .tagline {
      color: ${({ theme }) => theme.colors.titleBar.textInactive};
      font-size: 10px;
      margin-top: 8px;
    }

    .summary {
      font-size: 12px;
      line-height: 1.55;
      margin-top: 14px;
    }

    h3 {
      color: ${({ theme }) => theme.colors.highlight};
      font-size: 10px;
      letter-spacing: 0.08em;
      margin-top: 18px;
      text-transform: uppercase;
    }

    ul {
      font-size: 12px;
      line-height: 1.5;
      margin-top: 6px;
      padding-left: 16px;

      li {
        list-style: disc;
        margin-top: 4px;
      }
    }

    .stack {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;

      span {
        background-color: ${({ theme }) => theme.colors.fileEntry.background};
        border: 1px solid ${({ theme }) => theme.colors.fileEntry.border};
        border-radius: 3px;
        font-size: 10px;
        padding: 2px 6px;
      }
    }
  }

  /* States are shown for context only, so they read as text, not controls. */
  .places {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    gap: 7px;
    margin-top: 6px;

    small {
      color: ${({ theme }) => theme.colors.titleBar.textInactive};
      display: block;
      font-size: 10px;
      margin-top: 1px;
    }
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;

    button {
      background-color: transparent;
      border: 1px solid transparent;
      border-radius: 3px;
      color: inherit;
      font-family: inherit;
      font-size: 12px;
      padding: 7px 9px;
      text-align: left;
      transition: background-color 150ms ease;

      &:hover,
      &.active {
        background-color: ${({ theme }) => theme.colors.fileEntry.background};
        border-color: ${({ theme }) => theme.colors.fileEntry.border};
      }

      small {
        color: ${({ theme }) => theme.colors.titleBar.textInactive};
        display: block;
        font-size: 10px;
        margin-top: 1px;
      }
    }
  }

  .empty {
    color: ${({ theme }) => theme.colors.titleBar.textInactive};
    font-size: 12px;
    line-height: 1.55;
  }
`;

export default StyledGlobe;
