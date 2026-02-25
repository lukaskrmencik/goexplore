import { useState, useEffect, useRef } from "react";
import { searchPlace } from "../../../../../services/geocodingService";
import type { SearchResult } from "../../../../../types/geocoding";
import { useDebounce } from "../../../../../hooks/useDebounce";
import { Search } from "lucide-react";
import './LocationSearch.css';

const LOCATION_SEARCH_DEBOUNCE = Number(import.meta.env.VITE_LOCATION_SEARCH_DEBOUNCE ?? "500");
const GEOCODING_MIN_QUERY_LENGTH = Number(import.meta.env.VITE_GEOCODING_MIN_QUERY_LENGTH ?? "2");

interface LocationSearchProps {
    label: string;
    placeholder?: string;
    onSelect: (lat: number, lng: number, name: string) => void;
    initialValue?: string;
    clearOnSelect?: boolean;
    isCompact?: boolean;
    autoFocus?: boolean;
    onClose?: () => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
    label,
    placeholder,
    onSelect,
    initialValue,
    clearOnSelect = false,
    isCompact = false,
    autoFocus = false,
    onClose
}) => {
    const [query, setQuery] = useState(initialValue || "");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // We use matchRef to prevent re-searching when user selects an item
    const isTypingRef = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, LOCATION_SEARCH_DEBOUNCE);

    // Sync initialValue if provided (and we are not typing)
    useEffect(() => {
        if (!isTypingRef.current && initialValue) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    useEffect(() => {
        // Only search if the user is actively typing
        if (!isTypingRef.current) return;

        if (debouncedQuery.length >= GEOCODING_MIN_QUERY_LENGTH) {
            setIsLoading(true);
            searchPlace(debouncedQuery)
                .then(data => {
                    setResults(data);
                    setIsOpen(true);
                })
                .catch(error => {
                    console.error("Search failed", error);
                    setResults([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [debouncedQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isTypingRef.current = true;
        setQuery(e.target.value);
    };

    const handleSelect = (item: SearchResult) => {
        isTypingRef.current = false; // Stop searching

        if (clearOnSelect) {
            setQuery("");
        } else {
            setQuery(item.display_name);
        }

        setIsOpen(false);
        onSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (onClose) onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isCompact) {
        return (
            <div className="location-search-wrapper" ref={wrapperRef}>
                <div className="location-search-input-container">
                    <div className="location-search-icon-left">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        className="location-search-input-compact location-search-input-with-icon"
                        placeholder={placeholder || "Hledat..."}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (results.length > 0 && query.length >= GEOCODING_MIN_QUERY_LENGTH) setIsOpen(true);
                        }}
                        autoFocus={autoFocus}
                    />
                    {isLoading ? (
                        <div className="location-search-spinner-container">
                            <svg className="location-search-spinner-icon-compact" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : null}
                </div>
                {/* Improved Dropdown for Compact */}
                {isOpen && results.length > 0 && (
                    <ul className="location-search-dropdown-list location-search-dropdown-list-compact custom-scrollbar">
                        {results.map((item) => (
                            <li
                                key={item.place_id}
                                className="location-search-dropdown-item-compact"
                                onClick={() => handleSelect(item)}
                            >
                                {item.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }

    return (
        <div className="location-search-group" ref={wrapperRef}>
            <label className="location-search-label">{label}</label>
            <div className="location-search-input-container">
                <div className="location-search-icon-left">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    className="location-search-input-default location-search-input-with-icon"
                    placeholder={placeholder || "Zadejte místo..."}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (results.length > 0 && query.length >= GEOCODING_MIN_QUERY_LENGTH) setIsOpen(true);
                    }}
                    autoFocus={autoFocus}
                />
                {isLoading && (
                    <div className="location-search-spinner-container">
                        <svg className="location-search-spinner-icon-default" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <ul className="location-search-dropdown-list location-search-dropdown-list-default custom-scrollbar">
                    {results.map((item) => (
                        <li
                            key={item.place_id}
                            className="location-search-dropdown-item-default"
                            onClick={() => handleSelect(item)}
                        >
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationSearch;