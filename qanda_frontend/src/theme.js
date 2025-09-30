//
// Ocean Professional Theme Tokens and helpers
//

// PUBLIC_INTERFACE
export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB",     // Blue
    secondary: "#F59E0B",   // Amber
    success: "#F59E0B",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    shadow: "rgba(0,0,0,0.06)",
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    round: "999px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 10px 25px rgba(0,0,0,0.10)",
  },
  transition: "all 200ms ease",
};

// PUBLIC_INTERFACE
export function applyTheme() {
  const r = document.documentElement;
  const c = theme.colors;
  r.style.setProperty("--oc-primary", c.primary);
  r.style.setProperty("--oc-secondary", c.secondary);
  r.style.setProperty("--oc-success", c.success);
  r.style.setProperty("--oc-error", c.error);
  r.style.setProperty("--oc-bg", c.background);
  r.style.setProperty("--oc-surface", c.surface);
  r.style.setProperty("--oc-text", c.text);
  r.style.setProperty("--oc-text-muted", c.textMuted);
  r.style.setProperty("--oc-border", c.border);
  r.style.setProperty("--oc-shadow", c.shadow);

  r.style.setProperty("--oc-radius-sm", theme.radii.sm);
  r.style.setProperty("--oc-radius-md", theme.radii.md);
  r.style.setProperty("--oc-radius-lg", theme.radii.lg);
  r.style.setProperty("--oc-radius-round", theme.radii.round);

  r.style.setProperty("--oc-shadow-sm", theme.shadow.sm);
  r.style.setProperty("--oc-shadow-md", theme.shadow.md);
  r.style.setProperty("--oc-shadow-lg", theme.shadow.lg);

  r.style.setProperty("--oc-transition", theme.transition);
}
