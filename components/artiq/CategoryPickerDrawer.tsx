"use client";

import { useState, useMemo } from "react";
import { X, Search, Check, Layers } from "lucide-react";
import { CATEGORY_TAXONOMY, CategoryItem } from "@/lib/categories";

interface CategoryPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}

export function CategoryPickerDrawer({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
}: CategoryPickerDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Group categories: Traditional Art subcategories vs other primary categories
  const { traditionalGroup, otherCategories } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const matches = (cat: CategoryItem) => {
      if (!query) return true;
      return (
        cat.label.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query)) ||
        cat.id.toLowerCase().includes(query)
      );
    };

    const traditionalSub = CATEGORY_TAXONOMY.filter(
      (c) => (c.parentId === "traditional" || c.id === "traditional") && matches(c)
    );

    const others = CATEGORY_TAXONOMY.filter(
      (c) => c.parentId !== "traditional" && c.id !== "traditional" && matches(c)
    );

    return {
      traditionalGroup: traditionalSub,
      otherCategories: others,
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-drawer-title"
      className="fixed inset-0 z-50 bg-espresso/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-surface border-2 border-ink rounded-t-[24px] sm:rounded-[24px] shadow-hard-lg overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b-2 border-ink flex items-center justify-between gap-3 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sand border-2 border-ink text-ink flex items-center justify-center shadow-hard-sm">
              <Layers className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 id="category-drawer-title" className="font-bold text-ink text-base font-display">
                All Art Categories
              </h2>
              <p className="text-xs text-ink-soft">
                Select traditions and disciplines that best describe this piece
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            className="btn-hard w-9 h-9 rounded-full bg-mist border-2 border-ink text-ink flex items-center justify-center shadow-hard-sm hover:bg-white"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b-2 border-ink/15 bg-canvas">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 pointer-events-none stroke-[2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories (e.g. Mural, Madhubani, Weaving)…"
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[44px]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-ink font-bold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Group 1: Traditional Art & Regional Subcategories */}
          {traditionalGroup.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
                  Traditional Art & Heritage Forms
                </span>
              </div>

              <div className="space-y-2">
                {traditionalGroup.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onToggleCategory(cat.id)}
                      className={`btn-hard w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 min-h-[48px] ${
                        isSelected
                          ? "bg-sand border-ink text-ink shadow-hard-sm"
                          : "bg-surface border-ink/40 hover:border-ink text-ink shadow-none"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate">
                            {cat.label}
                          </span>
                          {cat.parentId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-sand-tint border border-ink text-ink font-mono font-bold uppercase">
                              Tradition
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-ink-soft truncate mt-0.5 font-sans">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border-2 border-ink flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-leaf text-ink shadow-hard-sm"
                            : "bg-canvas text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Other Art Disciplines */}
          {otherCategories.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider font-mono">
                  Other Disciplines
                </span>
              </div>

              <div className="space-y-2">
                {otherCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onToggleCategory(cat.id)}
                      className={`btn-hard w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 min-h-[48px] ${
                        isSelected
                          ? "bg-sand border-ink text-ink shadow-hard-sm"
                          : "bg-surface border-ink/40 hover:border-ink text-ink shadow-none"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold truncate block">
                          {cat.label}
                        </span>
                        {cat.description && (
                          <p className="text-xs text-ink-soft truncate mt-0.5 font-sans">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border-2 border-ink flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-leaf text-ink shadow-hard-sm"
                            : "bg-canvas text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {traditionalGroup.length === 0 && otherCategories.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-ink">No categories match &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-ink-soft">
                Try searching for &ldquo;mural&rdquo;, &ldquo;traditional&rdquo;, or &ldquo;handicrafts&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t-2 border-ink bg-surface flex items-center justify-between gap-3">
          <span className="text-xs text-ink-soft font-mono font-bold">
            {selectedCategories.length} selected (at least 1 required)
          </span>

          <button
            type="button"
            onClick={onClose}
            className="btn-hard px-6 py-2.5 rounded-[10px] bg-leaf text-ink font-bold text-sm shadow-hard min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
