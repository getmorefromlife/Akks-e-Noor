import { useState } from "react";
import { THEMES, CALENDAR_MONTHS, ISLAMIC_MONTHS, MASOOMEEN, OCCASIONS } from "@/lib/posters";

const MASOOMEEN_SHORT: Record<string, { name: string; ar: string }> = {
  "Prophet Muhammad (s)": { name: "Muhammad", ar: "محمد" },
  "Imam Ali (a)": { name: "Ali", ar: "عـلي" },
  "Lady Fatima (a)": { name: "Fatima", ar: "فاطمة" },
  "Imam Hasan (a)": { name: "Hasan", ar: "حسـن" },
  "Imam Husayn (a)": { name: "Husayn", ar: "حسين" },
  "Imam Ali Zayn al-Abidin (a)": { name: "Sajjad", ar: "سجاد" },
  "Imam Muhammad al-Baqir (a)": { name: "Baqir", ar: "باقر" },
  "Imam Ja'far al-Sadiq (a)": { name: "Sadiq", ar: "صادق" },
  "Imam Musa al-Kadhim (a)": { name: "Kadhim", ar: "كاظم" },
  "Imam Ali al-Rida (a)": { name: "Rida", ar: "رضا" },
  "Imam Muhammad al-Jawad (a)": { name: "Jawad", ar: "جواد" },
  "Imam Ali al-Hadi (a)": { name: "Hadi", ar: "هادي" },
  "Imam Hasan al-Askari (a)": { name: "Askari", ar: "عسكري" },
  "Imam al-Mahdi (aj)": { name: "Mahdi", ar: "مهدي" },
};

export const ORIENTATIONS = ["portrait", "landscape", "square"] as const;

export type Filters = {
  themes: string[];
  calendarMonths: string[];
  islamicMonths: string[];
  masoomeen: string[];
  occasions: string[];
  orientations: string[];
};

export const emptyFilters: Filters = {
  themes: [],
  calendarMonths: [],
  islamicMonths: [],
  masoomeen: [],
  occasions: [],
  orientations: [],
};

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

// ----------------------------------------------------
// Desktop Dropdown Component
// ----------------------------------------------------
function DesktopDropdown({
  title, options, selected, onToggle, isOpen, onToggleOpen,
}: {
  title: string; options: readonly string[]; selected: string[];
  onToggle: (v: string) => void; isOpen: boolean; onToggleOpen: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
          selected.length > 0
            ? "border-foreground bg-foreground text-background shadow-sm"
            : "border-border/80 bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
        }`}
      >
        <span>{title}</span>
        {selected.length > 0 ? (
          <span className="ml-0.5 rounded-full bg-background text-foreground px-1.5 py-0.5 text-[9px] font-bold">
            {selected.length}
          </span>
        ) : (
          <span className="text-[10px] opacity-60">▼</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2.5 z-30 w-64 rounded-xl border border-border bg-background p-4 shadow-lift animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {options.map((opt) => {
              const active = selected.includes(opt);
              const displayOpt = MASOOMEEN_SHORT[opt]
                ? `${opt} (${MASOOMEEN_SHORT[opt].ar})`
                : opt.charAt(0).toUpperCase() + opt.slice(1);
              return (
                <label
                  key={opt}
                  className="flex items-center gap-3 text-xs text-foreground cursor-pointer select-none py-1.5 px-1 hover:bg-secondary/45 rounded transition-all"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(opt)}
                    className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                  />
                  <span className={active ? "font-semibold" : ""}>{displayOpt}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Mobile Vertical Group (Accordion/Collapsible)
// ----------------------------------------------------
function MobileGroup({
  title, options, selected, onToggle,
}: {
  title: string; options: readonly string[]; selected: string[];
  onToggle: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-border/40 py-3 text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left py-1"
      >
        <span className="font-serif text-sm font-semibold tracking-tight text-foreground/90">
          {title}
          {selected.length > 0 && (
            <span className="ml-2 rounded-full bg-foreground text-background px-1.5 py-0.5 text-[9px] font-bold">
              {selected.length}
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 animate-in fade-in duration-200">
          {options.map((opt) => {
            const active = selected.includes(opt);
            const displayOpt = MASOOMEEN_SHORT[opt]
              ? `${opt} (${MASOOMEEN_SHORT[opt].ar})`
              : opt.charAt(0).toUpperCase() + opt.slice(1);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/60"
                }`}
              >
                {displayOpt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Main FilterPanel Component
// ----------------------------------------------------
export function FilterPanel({
  filters, setFilters,
}: {
  filters: Filters; setFilters: (f: Filters) => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const total = Object.values(filters).reduce((n, a) => n + a.length, 0);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="w-full">
      {/* Click-outside Backdrop for Desktop Dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-20 hidden md:block"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* ------------------ DESKTOP DROPDOWN BAR ------------------ */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-3">
        <DesktopDropdown
          title="Templates"
          options={THEMES}
          selected={filters.themes}
          onToggle={(v) => setFilters({ ...filters, themes: toggle(filters.themes, v) })}
          isOpen={activeDropdown === "themes"}
          onToggleOpen={() => toggleDropdown("themes")}
        />
        <DesktopDropdown
          title="14 Masoomeen"
          options={MASOOMEEN}
          selected={filters.masoomeen}
          onToggle={(v) => setFilters({ ...filters, masoomeen: toggle(filters.masoomeen, v) })}
          isOpen={activeDropdown === "masoomeen"}
          onToggleOpen={() => toggleDropdown("masoomeen")}
        />

        <DesktopDropdown
          title="Islamic Months"
          options={ISLAMIC_MONTHS}
          selected={filters.islamicMonths}
          onToggle={(v) => setFilters({ ...filters, islamicMonths: toggle(filters.islamicMonths, v) })}
          isOpen={activeDropdown === "islamicMonths"}
          onToggleOpen={() => toggleDropdown("islamicMonths")}
        />
        <DesktopDropdown
          title="Occasions"
          options={OCCASIONS}
          selected={filters.occasions}
          onToggle={(v) => setFilters({ ...filters, occasions: toggle(filters.occasions, v) })}
          isOpen={activeDropdown === "occasions"}
          onToggleOpen={() => toggleDropdown("occasions")}
        />
        <DesktopDropdown
          title="Calendar Months"
          options={CALENDAR_MONTHS}
          selected={filters.calendarMonths}
          onToggle={(v) => setFilters({ ...filters, calendarMonths: toggle(filters.calendarMonths, v) })}
          isOpen={activeDropdown === "calendarMonths"}
          onToggleOpen={() => toggleDropdown("calendarMonths")}
        />
        <DesktopDropdown
          title="Dimensions"
          options={ORIENTATIONS}
          selected={filters.orientations}
          onToggle={(v) => setFilters({ ...filters, orientations: toggle(filters.orientations, v) })}
          isOpen={activeDropdown === "orientations"}
          onToggleOpen={() => toggleDropdown("orientations")}
        />

        {/* Clear all inline button */}
        {total > 0 && (
          <button
            onClick={() => setFilters(emptyFilters)}
            className="rounded-full border border-destructive/30 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-destructive hover:border-destructive hover:bg-destructive/5 transition-all"
          >
            Clear ({total})
          </button>
        )}
      </div>

      {/* ------------------ MOBILE VERTICAL ACCORDION ------------------ */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
          <span className="font-serif text-base font-semibold">Filter collection</span>
          {total > 0 && (
            <button
              onClick={() => setFilters(emptyFilters)}
              className="text-[10px] font-bold uppercase tracking-widest text-destructive"
            >
              Clear all ({total})
            </button>
          )}
        </div>
        <MobileGroup
          title="Templates"
          options={THEMES}
          selected={filters.themes}
          onToggle={(v) => setFilters({ ...filters, themes: toggle(filters.themes, v) })}
        />
        <MobileGroup
          title="14 Masoomeen"
          options={MASOOMEEN}
          selected={filters.masoomeen}
          onToggle={(v) => setFilters({ ...filters, masoomeen: toggle(filters.masoomeen, v) })}
        />
        <MobileGroup
          title="Islamic Months"
          options={ISLAMIC_MONTHS}
          selected={filters.islamicMonths}
          onToggle={(v) => setFilters({ ...filters, islamicMonths: toggle(filters.islamicMonths, v) })}
        />
        <MobileGroup
          title="Occasions"
          options={OCCASIONS}
          selected={filters.occasions}
          onToggle={(v) => setFilters({ ...filters, occasions: toggle(filters.occasions, v) })}
        />
        <MobileGroup
          title="Calendar Months"
          options={CALENDAR_MONTHS}
          selected={filters.calendarMonths}
          onToggle={(v) => setFilters({ ...filters, calendarMonths: toggle(filters.calendarMonths, v) })}
        />
        <MobileGroup
          title="Dimensions"
          options={ORIENTATIONS}
          selected={filters.orientations}
          onToggle={(v) => setFilters({ ...filters, orientations: toggle(filters.orientations, v) })}
        />
      </div>
    </div>
  );
}
