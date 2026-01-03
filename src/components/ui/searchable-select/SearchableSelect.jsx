"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  onSearch,
  placeholder = "Select an option",
  displayKey = "name",
  valueKey = "_id",
  loading = false,
  disabled = false,
  required = false,
  error = null,
  className = "",
  initialLimit = 20,
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  showClearButton = true,
  renderOption = null, // Custom render function for options
  getOptionLabel = null, // Custom function to get label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get display label for an option
  const getLabel = (option) => {
    if (getOptionLabel) {
      return getOptionLabel(option);
    }
    if (typeof displayKey === "function") {
      return displayKey(option);
    }
    return option[displayKey] || option.title || option.name || String(option);
  };

  // Get value for an option
  const getValue = (option) => {
    if (typeof valueKey === "function") {
      return valueKey(option);
    }
    return option[valueKey] || option._id || option.id;
  };

  // Find selected option
  const selectedOption = options.find(
    (opt) => getValue(opt) === value
  );

  // Initialize filtered options
  useEffect(() => {
    if (options.length > 0) {
      // Show initial limited options
      const initial = options.slice(0, initialLimit);
      setFilteredOptions(initial);
    } else {
      setFilteredOptions([]);
    }
  }, [options, initialLimit]);

  // Handle search
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      return;
    }

    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim() === "") {
        // Show initial limited options when search is cleared
        setFilteredOptions(options.slice(0, initialLimit));
        setIsSearching(false);
      } else {
        // If onSearch callback is provided, use it for server-side search
        if (onSearch) {
          setIsSearching(true);
          onSearch(searchTerm)
            .then((results) => {
              setFilteredOptions(results || []);
              setIsSearching(false);
            })
            .catch(() => {
              setIsSearching(false);
            });
        } else {
          // Client-side filtering
          const filtered = options.filter((option) => {
            const label = getLabel(option).toLowerCase();
            return label.includes(searchTerm.toLowerCase());
          });
          setFilteredOptions(filtered);
        }
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, isOpen, options, onSearch, initialLimit, getLabel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle option selection
  const handleSelect = (option) => {
    const optionValue = getValue(option);
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border rounded-lg cursor-pointer
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500/10" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <span
            className={`block truncate ${
              value ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {value && selectedOption
              ? getLabel(selectedOption)
              : placeholder}
          </span>
          <div className="flex items-center gap-2 ml-2">
            {showClearButton && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {loading || isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getValue(option);
                const isSelected = value === optionValue;
                const label = getLabel(option);

                return (
                  <div
                    key={optionValue || index}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors
                      ${isSelected ? "bg-blue-100 font-medium" : ""}
                    `}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <span className="text-sm text-gray-900">{label}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Show more indicator */}
          {!searchTerm && options.length > initialLimit && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              Showing {filteredOptions.length} of {options.length}. Type to search all options.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

