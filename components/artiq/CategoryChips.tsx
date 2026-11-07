"use client";

import { CATEGORY_TAXONOMY } from "@/lib/categories";

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
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <nav
      aria-label="Artwork categories"
      className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 flex items-center gap-2"
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(cat.key)}
            aria-pressed={isSelected}
            className={`whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "bg-surface border border-line text-ink hover:bg-canvas"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </nav>
  );
}

