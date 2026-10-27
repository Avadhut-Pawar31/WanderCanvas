'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Search, MapPin, Loader2 } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputValue = value !== undefined ? value : internalValue;
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleTextChange = (newVal: string) => {
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isKeyValid = Boolean(apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY');

  useEffect(() => {
    if (!isKeyValid || !inputRef.current) return;

    let isMounted = true;
    setIsLoading(true);

    setOptions({
      key: apiKey!,
      v: 'weekly',
    });

    importLibrary('places')
      .then(() => {
        if (!isMounted || !inputRef.current) return;
        setIsLoading(false);

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['name', 'formatted_address', 'geometry', 'place_id'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const name = place.name || '';
          const address = place.formatted_address || name;

          handleTextChange(name);
          onPlaceSelect({
            name,
            address,
            coordinates: { lat, lng },
            googlePlaceId: place.place_id,
          });
        });

        autocompleteRef.current = autocomplete;
      })
      .catch((err: unknown) => {
        console.warn('Google Places Autocomplete notice:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, isKeyValid, onPlaceSelect]);

  return (
    <div className={`relative flex items-center ${className}`}>
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
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#244536]/15 text-sm text-[#292D2A] placeholder:text-[#5F6761]/60 focus:outline-none focus:ring-2 focus:ring-[#244536]/20 focus:border-[#244536] transition shadow-xs"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            handleTextChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 text-xs text-[#5F6761]/60 hover:text-[#292D2A]"
        >
          ✕
        </button>
      )}
    </div>
  );
}
