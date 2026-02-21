import EquipmentEditor from "../../features/editors/equipmentEditor/EquipmentEditor/EquipmentEditor";
import "./EquipmentPage.css";

const EquipmentPage = () => (
    <div className="equipment-page-container equipment-page-content">
        <header className="equipment-page-header">
            <h1 className="equipment-page-title">Moje Vybavení</h1>
            <p className="equipment-page-subtitle">Spravujte svou sbírku vybavení pro všechna vaše dobrodružství.</p>
        </header>

        <EquipmentEditor />
    </div>
);
export default EquipmentPage;
