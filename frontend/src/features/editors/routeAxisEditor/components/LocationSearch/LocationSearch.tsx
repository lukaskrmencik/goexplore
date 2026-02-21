import { useState, useEffect, useRef } from "react";
import { searchPlace } from "../../../../../services/geocodingService";
import type { SearchResult } from "../../../../../services/geocodingService";
import './LocationSearch.css';

interface LocationSearchProps {
    label: string;
    placeholder?: string;
    onSelect: (lat: number, lng: number, name: string) => void;
    initialValue?: string;
    clearOnSelect?: boolean;
    isCompact?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
    label,
    placeholder,
    onSelect,
    initialValue,
    clearOnSelect = false,
    isCompact = false
}) => {
    const [query, setQuery] = useState(initialValue || "");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // We use matchRef to prevent re-searching when user selects an item
    const isTypingRef = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync initialValue if provided (and we are not typing)
    useEffect(() => {
        if (!isTypingRef.current && initialValue) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    useEffect(() => {
        // Only search if the user is actively typing
        if (!isTypingRef.current) return;

        const timeoutId = setTimeout(async () => {
            if (query.length >= 2) { // Changed to 2 to match geocodingService check
                setIsLoading(true);
                try {
                    const data = await searchPlace(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isCompact) {
        return (
            <div className="location-search-wrapper" ref={wrapperRef}>
                <div className="location-search-input-container">
                    <input
                        type="text"
                        className="location-search-input-compact"
                        placeholder={placeholder || "Hledat..."}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (results.length > 0 && query.length >= 2) setIsOpen(true);
                        }}
                    />
                    {isLoading ? (
                        <div className="location-search-spinner-container">
                            <svg className="location-search-spinner-icon-compact" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <div className="location-search-search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    )}
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
                <input
                    type="text"
                    className="location-search-input-default"
                    placeholder={placeholder || "Zadejte místo..."}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (results.length > 0 && query.length >= 2) setIsOpen(true);
                    }}
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