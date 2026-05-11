import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefing } from "@/client/Briefing";
import { BookingCard } from "@/client/BookingCard";
import { GapsTable } from "@/client/GapsTable";
import type { Booking, ChecklistKey, Gap } from "@/client/types";

const tablerCss = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Host Dashboard" },
      { name: "description", content: "Daily briefing, upcoming bookings, and pricing gaps for short-term rental hosts." },
    ],
    links: [{ rel: "stylesheet", href: tablerCss }],
  }),
  component: Index,
});

const initialBookings: Booking[] = [
  { id: "airbnb-HMABCD1234@google.com", guestName: "Sarah K.", guests: 2, reservationUrl: "https://www.airbnb.com/hosting/reservations/details/HMABCD1234", checkIn: "2026-05-10", checkOut: "2026-05-12", nights: 2, turnover: "11am–3pm May 12 (same-day check-in)", status: "Active", checklist: { notified: true, confirmed: true, reminder: false, ready: false, checkedIn: true, checkedOut: false, reviewed: false }, sameDayTurnaround: true, notes: "Late checkout requested — confirmed 11am." },
  { id: "airbnb-HMEFGH5678@google.com", guestName: "Marcus T.", guests: 4, reservationUrl: "https://www.airbnb.com/hosting/reservations/details/HMEFGH5678", checkIn: "2026-05-12", checkOut: "2026-05-15", nights: 3, turnover: "Check-in 3pm May 12", status: "Upcoming", checklist: { notified: true, confirmed: true, reminder: false, ready: false, checkedIn: false, checkedOut: false, reviewed: false }, notes: "" },
  { id: "airbnb-HMIJKL9012@google.com", guestName: "Priya R.", guests: 3, reservationUrl: "https://www.airbnb.com/hosting/reservations/details/HMIJKL9012", checkIn: "2026-05-17", checkOut: "2026-05-21", nights: 4, turnover: "10am–3pm May 17", status: "Upcoming", checklist: { notified: true, confirmed: false, reminder: false, ready: false, checkedIn: false, checkedOut: false, reviewed: false }, notes: "" },
];

const gaps: Gap[] = [
  { dates: "May 12–13", nights: 1, price: "$145", flag: "Min stay 3" },
  { dates: "May 17–19", nights: 2, price: "$162", flag: "Min stay 3" },
];

const briefingMock = {
  id: "mock-briefing-1",
  text: "One active stay checking out today at noon. Cleaner is confirmed for the 10am–4pm window. Next guest arrives May 13 — message them tonight to share door code and parking notes.",
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.06em", fontWeight: 600, margin: "0 0 10px" }}>
      {children}
    </h2>
  );
}

function Index() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const updateChecklist = (id: string, next: Record<ChecklistKey, boolean>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, checklist: next } : b)));
  };

  const updateNotes = (id: string, notes: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, notes } : b)));
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-background-primary)", padding: "2rem 1rem" }}>
      <h1 className="sr-only">Host Dashboard</h1>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        <Briefing
          id={briefingMock.id}
          text={briefingMock.text}
          onFeedback={(helpful) => console.log("briefing feedback:", { id: briefingMock.id, helpful })}
        />

        <section>
          <SectionHeader>Upcoming bookings</SectionHeader>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
            <div>Standard check-in is 3pm.</div>
            <div style={{ marginTop: 8, fontWeight: 600, color: "var(--color-text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>Cleaner coordination</div>
            <ul style={{ paddingLeft: 18, margin: "2px 0 0" }}>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Notified</strong>: cleaner has been informed.</li>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Confirmed</strong>: cleaner has agreed.</li>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Reminder</strong>: follow-up sent 1–2 days before with checkout date and window.</li>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Ready</strong>: turnover complete, unit is guest-ready.</li>
            </ul>
            <div style={{ marginTop: 8, fontWeight: 600, color: "var(--color-text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>Guest stay</div>
            <ul style={{ paddingLeft: 18, margin: "2px 0 0" }}>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Checked In</strong>: confirmed guest has arrived.</li>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Checked Out</strong>: confirmed guest has departed.</li>
              <li><strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Reviewed</strong>: review submitted on the platform.</li>
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} onChecklistChange={(next) => updateChecklist(b.id, next)} onNotesChange={(n) => updateNotes(b.id, n)} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader>Gaps and pricing</SectionHeader>
          <GapsTable rows={gaps} />
        </section>
      </div>
    </main>
  );
}
