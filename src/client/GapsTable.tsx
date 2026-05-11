import type { Gap } from "./types";

export function GapsTable({ rows }: { rows: Gap[] }) {
  const cell: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 13,
    color: "var(--color-text-primary)",
    borderTop: "0.5px solid var(--color-border-tertiary)",
    textAlign: "left",
  };
  const head: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 12,
    color: "var(--color-text-muted)",
    textAlign: "left",
    fontWeight: 600,
  };
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={head}>Dates</th>
            <th style={head}>Nights</th>
            <th style={head}>Avg price</th>
            <th style={head}>Flag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.dates}>
              <td style={cell}>{g.dates}</td>
              <td style={cell}>{g.nights}</td>
              <td style={cell}>{g.price}</td>
              <td style={{ ...cell, color: g.nights < 3 ? "var(--color-warning)" : "var(--color-text-muted)", fontWeight: g.nights < 3 ? 600 : 400 }}>
                {g.flag}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
