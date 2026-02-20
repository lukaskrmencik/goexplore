import { useState } from "react";
import type { RouteMode } from "../../../types/routes";
import { Badge } from "../../../components/ui/Badge";
import { Map, Zap } from "lucide-react";

interface RouteInitStepProps {
    onInitialize: (mode: RouteMode, name: string) => void;
    error: string | null;
}

const RouteInitStep: React.FC<RouteInitStepProps> = ({ onInitialize, error }) => {
    const [routeName, setRouteName] = useState("");

    return (
        <div className="h-[calc(100dvh-140px)] md:min-h-[calc(100vh-64px)] w-full bg-slate-50/50 flex items-center overflow-hidden md:overflow-auto">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Left Column: Context & Input */}
                    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="space-y-4 lg:space-y-6">
                            <Badge variant="primary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 text-sm">
                                Krok 1/3
                            </Badge>
                            <h1 className="text-3xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                                Kam to bude <span className="text-emerald-600">dnes?</span>
                            </h1>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="routeName" className="block text-base font-bold text-slate-900 uppercase tracking-wide ml-1 mb-3">
                                Název cesty
                            </label>
                            <div className="relative group">
                                <input
                                    id="routeName"
                                    type="text"
                                    placeholder="např. Víkend na Šumavě"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="w-full px-4 py-4 lg:px-6 lg:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50 text-lg lg:text-xl font-heading font-bold text-slate-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                                    <span className="text-sm font-bold">✎</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Název můžete kdykoliv později změnit
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Cards */}
                    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-100 max-w-lg">
                        {/* Simple Mode */}
                        <button
                            onClick={() => onInitialize('simple', routeName)}
                            className="group relative flex items-center gap-4 lg:gap-6 p-4 lg:p-8 rounded-2xl lg:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 text-left w-full"
                        >
                            <div className="shrink-0 w-12 h-12 lg:w-20 lg:h-20 bg-emerald-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                <Zap className="w-6 h-6 lg:w-9 lg:h-9" strokeWidth={1.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-heading font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                        Chytrý návrh
                                    </h3>
                                    <Badge variant="primary" className="bg-emerald-100 text-emerald-700 border-none">
                                        Doporučeno
                                    </Badge>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-medium hidden sm:block">
                                    Zadejte pouze start a cíl. Náš algoritmus najde nejzajímavější trasu mezi nimi.
                                </p>
                            </div>
                        </button>

                        {/* Manual Mode */}
                        <button
                            onClick={() => onInitialize('manual', routeName)}
                            className="group relative flex items-center gap-4 lg:gap-6 p-4 lg:p-8 rounded-2xl lg:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 text-left w-full"
                        >
                            <div className="shrink-0 w-12 h-12 lg:w-20 lg:h-20 bg-indigo-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Map className="w-6 h-6 lg:w-9 lg:h-9" strokeWidth={1.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-heading font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                        Vlastní trasa
                                    </h3>
                                    <Badge variant="neutral" className="bg-slate-100 text-slate-600 border-slate-200">
                                        Pokročilé
                                    </Badge>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-medium hidden sm:block">
                                    Plná kontrola. Vyklikejte si každý bod cesty ručně na mapě.
                                </p>
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RouteInitStep;
