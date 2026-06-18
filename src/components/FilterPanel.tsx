import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { THEMES, CALENDAR_MONTHS, ISLAMIC_MONTHS, MASOOMEEN, OCCASIONS } from "@/lib/posters";

export type Filters = {
  themes: string[];
  calendarMonths: string[];
  islamicMonths: string[];
  masoomeen: string[];
  occasions: string[];
};

export const emptyFilters: Filters = {
  themes: [], calendarMonths: [], islamicMonths: [], masoomeen: [], occasions: [],
};

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Group({
  title, options, selected, onToggle, defaultOpen = false,
}: {
  title: string; options: readonly string[]; selected: string[];
  onToggle: (v: string) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-serif text-lg text-foreground">{title}</span>
        <span className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="rounded-full bg-accent/40 px-2 py-0.5 text-xs">{selected.length}</span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterPanel({
  filters, setFilters,
}: {
  filters: Filters; setFilters: (f: Filters) => void;
}) {
  const total = Object.values(filters).reduce((n, a) => n + a.length, 0);
  return (
    <aside className="space-y-1">
      <div className="flex items-baseline justify-between pb-2">
        <h2 className="font-serif text-2xl">Filters</h2>
        {total > 0 && (
          <button
            onClick={() => setFilters(emptyFilters)}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>
      <Group title="Themes" options={THEMES} selected={filters.themes}
        onToggle={(v) => setFilters({ ...filters, themes: toggle(filters.themes, v) })}
        defaultOpen
      />
      <Group title="14 Masoomeen" options={MASOOMEEN} selected={filters.masoomeen}
        onToggle={(v) => setFilters({ ...filters, masoomeen: toggle(filters.masoomeen, v) })}
      />
      <Group title="Islamic Months" options={ISLAMIC_MONTHS} selected={filters.islamicMonths}
        onToggle={(v) => setFilters({ ...filters, islamicMonths: toggle(filters.islamicMonths, v) })}
      />
      <Group title="Occasions" options={OCCASIONS} selected={filters.occasions}
        onToggle={(v) => setFilters({ ...filters, occasions: toggle(filters.occasions, v) })}
      />
      <Group title="Calendar Months" options={CALENDAR_MONTHS} selected={filters.calendarMonths}
        onToggle={(v) => setFilters({ ...filters, calendarMonths: toggle(filters.calendarMonths, v) })}
      />
    </aside>
  );
}
