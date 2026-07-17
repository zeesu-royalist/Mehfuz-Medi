"use client";

interface SortDropdownProps {
  currentSort: string;
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  return (
    <select
      name="sort"
      defaultValue={currentSort}
      onChange={(e) => e.target.form?.submit()}
      className="flex h-10 w-full sm:w-44 rounded-sm border border-border bg-white px-3 py-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none font-semibold"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="featured">Featured First</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}
