export const tokens = {
  color: {
    primary: "#1e5c3a", // Dark forest green — buttons, highlights
    secondary: "#c49a1a", // Golden amber — accents, warnings
    danger: "#DC2626",   // Clear alerts for overdue
    warning: "#c49a1a",  // Golden amber — accents, warnings
    success: "#1e5c3a",  // Dark forest green — buttons, highlights
    white: "#FFFFFF",
    surface: "#fafaf8",  // Warm white — cards/surfaces
    background: "#f5f4f0", // Milky off-white — app background
    border: "#e5e4e0",
    text: {
      primary: "#1a2340", // Deep navy — headings + body
      secondary: "#6b7280", // Medium gray — labels, placeholders
      muted: "#9CA3AF"
    }
  },

  risk: {
    ON_TRACK: "#1e5c3a",
    AT_RISK: "#c49a1a",
    OVERDUE: "#DC2626"
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64
  },

  radius: {
    card: 16,
    button: 12,
    pill: 999
  },

  z: {
    modal: 1000,
    toast: 2000,
    sidebar: 50,
    header: 40
  }
};

