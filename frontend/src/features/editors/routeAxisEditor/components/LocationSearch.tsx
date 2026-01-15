import { useState, useEffect, useRef } from "react";
import { searchPlace } from "../../../../services/geocodingService";
import type { SearchResult } from "../../../../services/geocodingService";

interface LocationSearchProps {
    label: string;
    placeholder?: string;
    onSelect: (lat: number, lng: number, name: string) => void;
    initialValue?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ label, placeholder, onSelect, initialValue }) => {
    const [query, setQuery] = useState(initialValue || "");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 3) {
                const data = await searchPlace(query);
                setResults(data);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500); 

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (item: SearchResult) => {
        setQuery(item.display_name);
        setIsOpen(false);
        onSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={placeholder || "Zadejte místo..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            
            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {results.map((item) => (
                        <li
                            key={item.place_id}
                            className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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