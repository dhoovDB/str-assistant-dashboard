import { useEffect, useState } from "react";

type Props = {
  id: string;
  text: string;
  onFeedback: (helpful: boolean) => void;
};

// localStorage key prefix for the "you already voted on this briefing" marker.
// Keyed by briefing id so each day's briefing gets its own entry. Surviving
// reloads is the whole point — a vote should not reset just because the user
// refreshed the page on the same device. Cross-device voting is intentionally
// still possible (no server-side dedup); for a single-user dashboard this is
// the right tradeoff.
const LS_PREFIX = "briefing-feedback:";

export function Briefing({ id, text, onFeedback }: Props) {
  const [submitted, setSubmitted] = useState(false);

  // localStorage is unavailable on the SSR pass; this effect only runs client-side.
  // Brief flicker is possible between SSR (buttons appear active) and hydration
  // (buttons grey out if already voted). Acceptable for v1 — the briefing panel
  // is not load-bearing and the alternative (suppress SSR) costs more than it saves.
  useEffect(() => {
    try {
      if (localStorage.getItem(LS_PREFIX + id)) setSubmitted(true);
    } catch {
      // localStorage can throw in private-browsing modes or restricted environments —
      // fail closed (button stays active, user can vote, just no persistence).
    }
  }, [id]);

  const handleClick = (helpful: boolean) => {
    if (submitted) return;
    onFeedback(helpful);
    try {
      localStorage.setItem(LS_PREFIX + id, helpful ? "up" : "down");
    } catch {
      // Same swallow as above. The in-memory `submitted` state still prevents
      // a double-click within this page load.
    }
    setSubmitted(true);
  };

  const buttonStyle: React.CSSProperties = {
    background: "var(--color-background-primary)",
    color: submitted ? "var(--color-text-muted)" : "var(--color-text-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: submitted ? "not-allowed" : "pointer",
    opacity: submitted ? 0.45 : 1,
    fontSize: 14,
    lineHeight: 1,
  };

  return (
    <section
      style={{
        background: "var(--color-background-secondary)",
        borderLeft: "3px solid var(--color-teal)",
        borderTopRightRadius: "var(--border-radius-lg)",
        borderBottomRightRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
      }}
    >
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "var(--color-teal)", letterSpacing: "0.06em", fontWeight: 600 }}>
        Today's briefing
      </div>
      <p style={{ fontSize: 14, color: "var(--color-text-primary)", marginTop: 6, lineHeight: 1.55 }}>
        {text}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
        <button
          type="button"
          onClick={() => handleClick(true)}
          disabled={submitted}
          aria-label="Mark briefing helpful"
          title="Helpful"
          style={buttonStyle}
        >
          <i className="ti ti-thumb-up" />
        </button>
        <button
          type="button"
          onClick={() => handleClick(false)}
          disabled={submitted}
          aria-label="Mark briefing not helpful"
          title="Not helpful"
          style={buttonStyle}
        >
          <i className="ti ti-thumb-down" />
        </button>
      </div>
    </section>
  );
}
