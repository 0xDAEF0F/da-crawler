"use client";

import { useState } from "react";

export function JobFilters() {
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
            {["javascript", "react", "typescript", "python", "blockchain"].map(
              (tag) => (
                <div key={tag} className="flex items-center">
                  <input
                    id={`tag-${tag}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </label>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-sm font-medium">Salary Range</h3>
          <select className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm">
            <option>Any</option>
            <option>$50k - $100k</option>
            <option>$100k - $150k</option>
            <option>$150k+</option>
          </select>
        </div>

        <button
          type="button"
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
