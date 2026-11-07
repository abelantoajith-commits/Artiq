"use client";

import { CATEGORY_TAXONOMY } from "@/lib/categories";
import { Plus } from "lucide-react";

interface CategoryOption {
  key: string;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: "all", label: "All" },
  ...CATEGORY_TAXONOMY.map((c) => ({ key: c.id, label: c.label })),
];

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenMore?: () => void;
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
  onOpenMore,
}: CategoryChipsProps) {
  return (
    <nav
      aria-label="Artwork categories"
      className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 flex items-center gap-2 select-none"
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(cat.key)}
            aria-pressed={isSelected}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-sm border-[1.5px] border-espresso transition-all min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 ${
              isSelected
                ? "bg-sand font-bold text-espresso shadow-[2px_2px_0px_var(--shadow-ink)]"
                : "bg-surface font-semibold text-espresso hover:bg-mist"
            }`}
          >
            {cat.label}
          </button>
        );
      })}

      {/* Plus / More chip */}
      {onOpenMore && (
        <button
          type="button"
          onClick={onOpenMore}
          aria-label="More categories"
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full font-body font-bold text-sm border-[1.5px] border-espresso bg-surface text-espresso hover:bg-mist transition-colors min-h-[44px] flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-espresso" strokeWidth={2.5} />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}
