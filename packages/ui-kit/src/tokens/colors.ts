/**
 * Mosa design tokens — Bauhaus-inspired color palette.
 * Dark theme optimized for photo editing (reduce eye strain).
 */
export const tokens = {
  colors: {
    // Backgrounds
    bg: {
      primary: "#1a1a1a",
      secondary: "#242424",
      tertiary: "#2e2e2e",
      elevated: "#363636",
    },
    // Foregrounds
    fg: {
      primary: "#e8e8e8",
      secondary: "#a0a0a0",
      muted: "#666666",
    },
    // Accent
    accent: {
      primary: "#c85a3a",     // Warm terracotta (Bauhaus-inspired)
      hover: "#d46a4a",
      active: "#b84a2a",
    },
    // Semantic
    success: "#4a9e6a",
    warning: "#d4a843",
    error: "#c84848",
    // Borders
    border: {
      default: "#3a3a3a",
      focus: "#c85a3a",
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },
  font: {
    family: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    size: {
      xs: "11px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "20px",
    },
  },
} as const;
