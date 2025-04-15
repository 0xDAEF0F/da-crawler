"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type JobFiltersProps = {
  availableTags: string[];
};

export function JobFilters({ availableTags }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState(""); // State for the tag input

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

  // Helper function to update URL query params for tags
  const updateUrlTags = (tags: Set<string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const tagsString = Array.from(tags).join(",");

    if (tagsString) {
      current.set("tags", tagsString);
    } else {
      current.delete("tags");
    }
    current.delete("page"); // Reset page when tags change

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/${query}`);
  };

  // Handle selecting a tag from the suggestion list
  const handleSelectTag = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    newSelectedTags.add(tag);
    setSelectedTags(newSelectedTags);
    setInputValue(""); // Clear input after selection
    updateUrlTags(newSelectedTags);
  };

  // Handle removing a tag by clicking the 'x' on the badge
  const handleRemoveTag = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    newSelectedTags.delete(tag);
    setSelectedTags(newSelectedTags);
    updateUrlTags(newSelectedTags);
  };

  // Filter available tags based on input, excluding already selected tags
  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.has(tag),
  );

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
          {/* Display selected tags as Badges */}
          <div className="mb-2 flex min-h-[26px] flex-wrap gap-1">
            {Array.from(selectedTags).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ring-offset-background hover:bg-background/50 focus:ring-ring ml-1 rounded-full p-0.5 outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {/* Command component for autosuggest */}
          <Command className="overflow-visible rounded-lg border shadow-md">
            <CommandInput
              placeholder="Add tags..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue ? "No results found." : "Type to search tags."}
              </CommandEmpty>
              {inputValue && filteredTags.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {/* Limit displayed suggestions for performance/UX */}
                  {filteredTags.slice(0, 10).map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag} // value for Command's internal filtering/selection
                      onSelect={() => handleSelectTag(tag)}
                      className="cursor-pointer"
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      </div>
    </div>
  );
}
