import type { EquipmentType } from "../../../../types/equipment";

interface EquipmentItemProps {
    id: number;
    name: string;
    img: string | null;
    specifications: any;
    type: EquipmentType;
    isAdded: boolean;
    isProcessing: boolean;
    onToggle: (type: EquipmentType, id: number, isAdded: boolean) => void;
}

const EquipmentItem: React.FC<EquipmentItemProps> = ({
    id, name, img, specifications, type, isAdded, isProcessing, onToggle
}) => {

    // Helper to parse specs if string (API creates inconsistency sometimes)
    const getSpecsDisplay = () => {
        try {
            const specs = typeof specifications === 'string'
                ? JSON.parse(specifications)
                : specifications;

            if (!specs) return null;

            return Object.entries(specs).slice(0, 3).map(([key, val]) => (
                <span key={key} className="mr-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {key}: {String(val)}
                </span>
            ));
        } catch (e) {
            return null;
        }
    };

    return (
        <div className={`flex items-center justify-between rounded-lg border p-4 transition ${isAdded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                    {img ? <img src={img} alt={name} className="h-full w-full rounded-lg object-cover" /> : "📦"}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800">{name}</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {getSpecsDisplay()}
                    </div>
                </div>
            </div>

            <button
                onClick={() => onToggle(type, id, isAdded)}
                disabled={isProcessing}
                className={`ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition ${isAdded
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    } disabled:opacity-50`}
            >
                {isProcessing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isAdded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default EquipmentItem;
