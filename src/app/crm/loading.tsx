import React from 'react';

export default function CrmLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm space-y-3">
        <div className="h-4 w-44 rounded-md bg-secondary" />
        <div className="h-8 w-72 rounded-xl bg-muted" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted/70" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm h-28 flex flex-col justify-between"
          >
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-secondary" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-16 rounded-xl bg-muted/50 border border-border/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
