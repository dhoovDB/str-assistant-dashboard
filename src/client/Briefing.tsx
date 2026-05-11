import { useState } from "react";

type Props = {
  id: string;
  text: string;
  onFeedback: (helpful: boolean) => void;
};

export function Briefing({ id, text, onFeedback }: Props) {
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const submitted = submittedFor === id;

  const handleClick = (helpful: boolean) => {
    if (submitted) return;
    onFeedback(helpful);
    setSubmittedFor(id);
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
