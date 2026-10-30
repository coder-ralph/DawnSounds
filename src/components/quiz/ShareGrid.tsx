"use client";

/** Row of 🟩/🟥 squares — one per round. Rounds wrap at 10 so long Survival runs stay tidy. */
export function ShareGrid({ history, size = "size-6" }: { history: boolean[]; size?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5" role="img" aria-label={history.map((h) => (h ? "correct" : "wrong")).join(", ")}>
      {history.map((ok, i) => (
        <span key={i} className={`${size} rounded-md ${ok ? "bg-emerald-400" : "bg-rose-500"}`} />
      ))}
    </div>
  );
}

export const gridEmoji = (history: boolean[]) => history.map((h) => (h ? "🟩" : "🟥")).join("");
