"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type JobFiltersProps = {
  availableTags: string[];
};

export function JobFilters({ availableTags }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Initialize selected tags from URL search params
  useEffect(() => {
    const currentTags = searchParams.get("tags");
    if (currentTags) {
      setSelectedTags(new Set(currentTags.split(",")));
    } else {
      setSelectedTags(new Set()); // Clear selection if no tags in URL
    }
  }, [searchParams]);

  const [filters, setFilters] = useState({
    remote: false,
    fullTime: false,
    cryptoPayment: false,
  });

  const handleFilterChange = (name: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleTagChange = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);

    // Update URL
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const tagsString = Array.from(newSelectedTags).join(",");

    if (tagsString) {
      current.set("tags", tagsString);
    } else {
      current.delete("tags");
    }
    // Reset page to 1 when filters change
    current.delete("page");

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/${query}`);
  };

  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h2 className="mb-4 text-lg font-semibold">Filters</h2>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="remote"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            checked={filters.remote}
            onChange={() => handleFilterChange("remote")}
          />
          <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">
            Remote Only
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="fullTime"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            checked={filters.fullTime}
            onChange={() => handleFilterChange("fullTime")}
          />
          <label
            htmlFor="fullTime"
            className="ml-2 block text-sm text-gray-700"
          >
            Full-time Only
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="cryptoPayment"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            checked={filters.cryptoPayment}
            onChange={() => handleFilterChange("cryptoPayment")}
          />
          <label
            htmlFor="cryptoPayment"
            className="ml-2 block text-sm text-gray-700"
          >
            Crypto Payment Option
          </label>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-sm font-medium">Tags</h3>
          <div className="space-y-2">
            {availableTags.slice(10, 15).map((tag) => (
              <div key={tag} className="flex items-center">
                <input
                  id={`tag-${tag}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                  checked={selectedTags.has(tag)}
                  onChange={() => handleTagChange(tag)}
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
