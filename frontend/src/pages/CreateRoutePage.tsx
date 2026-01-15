import { useCreateRoute, STEPS } from "../features/createRoute/hooks/useCreateRoute";
import RouteAxisEditor from "../features/editors/routeAxisEditor/RouteAxisEditor";

const CreateRoutePage = () => {
    const { 
        route, 
        currentStep, 
        isLoading, 
        initializeRoute, 
        nextStep, 
        prevStep,
        setRoute 
    } = useCreateRoute();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <span className="text-xl font-semibold">Načítám...</span>
            </div>
        );
    }

    // Krok 0: Výběr módu
    if (currentStep === STEPS.INIT) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 p-4">
                <h1 className="text-4xl font-bold text-gray-800">Plánovač Roadtripu</h1>
                <div className="flex gap-6">
                    <button 
                        onClick={() => initializeRoute('simple')}
                        className="rounded-xl bg-blue-600 px-8 py-6 text-xl font-bold text-white shadow-lg transition hover:bg-blue-700 hover:scale-105"
                    >
                        Jednoduchý mód
                        <span className="mt-2 block text-sm font-normal opacity-80">Zadáš start a cíl, zbytek uděláme my.</span>
                    </button>
                    
                    <button 
                        onClick={() => initializeRoute('manual')} // Pozor: API očekává 'manual', ne 'custom'
                        className="rounded-xl bg-emerald-600 px-8 py-6 text-xl font-bold text-white shadow-lg transition hover:bg-emerald-700 hover:scale-105"
                    >
                        Custom mód
                        <span className="mt-2 block text-sm font-normal opacity-80">Naklikáš si celou trasu přesně v mapě.</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Hlavička */}
            <header className="border-b bg-white p-4 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        {route?.name || "Nová trasa"} 
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs uppercase text-gray-500">
                            {route?.mode === 'simple' ? 'Simple' : 'Custom'}
                        </span>
                    </h2>
                    <div className="text-sm text-gray-500">
                        Krok {currentStep} / {route?.mode === 'simple' ? 5 : 6}
                    </div>
                </div>
            </header>

            {/* Hlavní obsah */}
            <main className="container mx-auto flex-1 p-6">
                
                {/* 1. KROK: Editor Trasy (Mapa) */}
                {currentStep === STEPS.LOCATION && route ? (
                    <RouteAxisEditor 
                        route={route} 
                        onUpdate={setRoute} 
                    />
                ) : (
                    /* Placeholder pro ostatní kroky (zatím) */
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                        <h3 className="text-2xl font-bold text-gray-400">
                            {currentStep === STEPS.DATE && "Zde bude Editor Data"}
                            {currentStep === STEPS.USERS && "Zde bude Editor Uživatelů"}
                            {currentStep === STEPS.EQUIPMENT && "Zde bude Editor Vybavení"}
                            {currentStep === STEPS.CONFIG && "Zde bude Editor Konfigurace"}
                            {currentStep === STEPS.FINISH && "Souhrn a Výpočet"}
                        </h3>
                    </div>
                )}

            </main>

            {/* Patička s navigací */}
            <footer className="border-t bg-white p-4">
                <div className="container mx-auto flex justify-between">
                    <button 
                        onClick={prevStep}
                        // Zpět je zakázáno na prvním kroku editoru (LOCATION)
                        disabled={currentStep === STEPS.LOCATION}
                        className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Zpět
                    </button>
                    
                    {/* Tlačítko Pokračovat */}
                    <button 
                        onClick={nextStep}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        {currentStep === STEPS.FINISH ? "Vypočítat trasu" : "Pokračovat"}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CreateRoutePage;