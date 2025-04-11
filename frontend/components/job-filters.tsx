"use client"

import { useState } from "react"

export function JobFilters() {
  const [filters, setFilters] = useState({
    remote: false,
    fullTime: false,
    cryptoPayment: false,
  })

  const handleFilterChange = (name: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="remote"
            type="checkbox"
            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
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
            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
            checked={filters.fullTime}
            onChange={() => handleFilterChange("fullTime")}
          />
          <label htmlFor="fullTime" className="ml-2 block text-sm text-gray-700">
            Full-time Only
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="cryptoPayment"
            type="checkbox"
            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
            checked={filters.cryptoPayment}
            onChange={() => handleFilterChange("cryptoPayment")}
          />
          <label htmlFor="cryptoPayment" className="ml-2 block text-sm text-gray-700">
            Crypto Payment Option
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-sm mb-2">Tags</h3>
          <div className="space-y-2">
            {["javascript", "react", "typescript", "python", "blockchain"].map((tag) => (
              <div key={tag} className="flex items-center">
                <input
                  id={`tag-${tag}`}
                  type="checkbox"
                  className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label htmlFor={`tag-${tag}`} className="ml-2 block text-sm text-gray-700">
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-sm mb-2">Salary Range</h3>
          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md">
            <option>Any</option>
            <option>$50k - $100k</option>
            <option>$100k - $150k</option>
            <option>$150k+</option>
          </select>
        </div>

        <button
          type="button"
          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}
