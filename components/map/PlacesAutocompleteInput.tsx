'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

interface PlacesAutocompleteInputProps {
  placeholder?: string;
  onPlaceSelect: (place: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    googlePlaceId?: string;
  }) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
}

export function PlacesAutocompleteInput({
  placeholder = 'Search destination or stop...',
  onPlaceSelect,
  className = '',
  defaultValue = '',
  value,
  onChange,
  required,
}: PlacesAutocompleteInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputValue = value !== undefined ? value : internalValue;
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTextChange = (newVal: string) => {
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  // Debounced search with free OpenStreetMap Nominatim
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            inputValue.trim()
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (!res.ok) throw new Error('Search failed');
        const data: NominatimPlace[] = await res.json();
        if (isCurrent) {
          setSuggestions(data);
          setIsOpen(data.length > 0);
          setIsLoading(false);
        }
      } catch {
        if (isCurrent) {
          setIsLoading(false);
          setSuggestions([]);
        }
      }
    }, 350);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (item: NominatimPlace) => {
    const parts = item.display_name.split(',');
    const mainTitle = parts[0]?.trim() || item.display_name;
    const address = item.display_name;

    handleTextChange(mainTitle);
    setIsOpen(false);
    setSuggestions([]);

    onPlaceSelect({
      name: mainTitle,
      address,
      coordinates: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
    });
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[#244536]/50 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#244536]" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={inputValue}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-[#244536]/20 text-sm text-[#292D2A] placeholder:text-[#5F6761]/60 focus:outline-hidden focus:border-[#244536] transition shadow-xs"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              handleTextChange('');
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-md text-[#5F6761]/60 hover:text-[#292D2A] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-[#244536]/15 shadow-xl max-h-60 overflow-y-auto divide-y divide-[#244536]/5">
          <div className="px-3 py-1.5 bg-[#F7F5EF] text-[10px] font-mono text-[#244536]/70 flex items-center justify-between">
            <span>OpenStreetMap Global Search</span>
            <span className="text-[#244536] font-semibold">100% Free</span>
          </div>
          {suggestions.map((item) => {
            const parts = item.display_name.split(',');
            const primary = parts[0]?.trim() || item.display_name;
            const secondary = parts.slice(1).join(', ').trim();

            return (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F2EFE9] transition flex items-start gap-2.5 group"
              >
                <div className="w-6 h-6 rounded-lg bg-[#244536]/10 text-[#244536] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#244536] group-hover:text-white transition">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#292D2A] truncate">
                    {primary}
                  </div>
                  {secondary && (
                    <div className="text-xs text-[#5F6761] truncate">
                      {secondary}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
