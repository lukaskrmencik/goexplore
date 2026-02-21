import EquipmentEditor from "../features/editors/equipmentEditor/EquipmentEditor";

const EquipmentPage = () => (
    <div className="space-y-6 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
            <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Moje Vybavení</h1>
            <p className="text-lg text-slate-500 mt-2">Spravujte svou sbírku vybavení pro všechna vaše dobrodružství.</p>
        </header>

        <EquipmentEditor />
    </div>
);
export default EquipmentPage;
