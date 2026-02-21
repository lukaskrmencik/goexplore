import EquipmentItem from "./EquipmentItem";
import type { GeneralEquipment, MyEquipment, EquipmentType } from "../../../../types/equipment";
import type { Route } from "../../../../types/routes";

interface EquipmentListProps {
    items: (GeneralEquipment | MyEquipment)[];
    route: Route;
    type: EquipmentType;
    processingId: number | null;
    onToggle: (type: EquipmentType, id: number, isAdded: boolean) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ items, route, type, processingId, onToggle }) => {

    // Check if item is already in route
    const isAdded = (itemId: number) => {
        if (type === 'general') {
            return route.generalEquipment?.some(e => e.id === itemId) ?? false;
        } else {
            return route.myEquipment?.some(e => e.id === itemId) ?? false;
        }
    };

    if (items.length === 0) {
        return <div className="py-8 text-center text-gray-500">Žádné vybavení nenalezeno.</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <EquipmentItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    img={item.img}
                    specifications={(item as any).specifications || (item as any).general_specifications}
                    type={type}
                    isAdded={isAdded(item.id)}
                    isProcessing={processingId === item.id}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
};

export default EquipmentList;
