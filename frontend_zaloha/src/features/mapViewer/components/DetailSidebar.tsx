import React, { useEffect, useState } from 'react';
import { X, Clock, Star, Globe, Calendar, CreditCard, Tent, Info, ExternalLink, ChevronDown, ChevronUp, Ticket, Hourglass } from 'lucide-react';
import { fetchPoiDetail } from '../../../services/poiApiService';
import { fetchCampDetail } from '../../../services/campsApiService';

const OpeningHoursItem: React.FC<{ oh: any }> = ({ oh }) => {
    const [isOpen, setIsOpen] = useState(false);
    const CZECH_MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
    const CZECH_DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

    const monthFrom = CZECH_MONTHS[oh.month_from - 1] || oh.month_from;
    const monthTo = CZECH_MONTHS[oh.month_to - 1] || oh.month_to;

    const daysList = Object.entries(oh.days || {})
        .map(([dayNum, times]: [string, any]) => {
            const dayName = CZECH_DAYS[parseInt(dayNum) - 1] || dayNum;
            const timeFrom = times.from ? times.from.substring(0, 5) : "";
            const timeTo = times.to ? times.to.substring(0, 5) : "";
            return { dayName, timeFrom, timeTo, dayNum: parseInt(dayNum) };
        })
        .sort((a, b) => a.dayNum - b.dayNum);

    return (
        <div className="border-b border-slate-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2 group"
            >
                <div className="text-emerald-700 font-bold text-sm uppercase tracking-wide opacity-90 group-hover:text-emerald-800 transition-colors">
                    {monthFrom} - {monthTo}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />}
            </button>

            {isOpen && (
                <div className="pb-3 space-y-1.5 px-2 animate-fadeIn">
                    {daysList.map((dayItem, dIdx) => (
                        <div key={dIdx} className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">{dayItem.dayName}</span>
                            <span className="text-slate-900 font-bold">{dayItem.timeFrom} - {dayItem.timeTo}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface DetailSidebarProps {
    type: 'poi' | 'camp' | null;
    id: number | null;
    onClose: () => void;
}

const DetailSidebar: React.FC<DetailSidebarProps> = ({ type, id, onClose }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!type || !id) {
            setData(null);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                if (type === 'poi') {
                    const poiData = await fetchPoiDetail(id);
                    setData(poiData);
                } else if (type === 'camp') {
                    const campData = await fetchCampDetail(id);
                    setData(campData);
                }
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [type, id]);

    if (!type && !id && !data) return null;

    const isOpen = !!(type && id);

    return (
        <div className={`
            fixed top-14 bottom-[60px] left-0 right-0 z-[4000] rounded-none border-none
            md:absolute md:top-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-[400px] md:z-[1500]
            md:border-l md:border-slate-200 md:rounded-none md:translate-y-0
            shadow-2xl transition-transform duration-300 ease-in-out bg-white
            transform ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0'}
            flex flex-col overflow-hidden
        `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
                <h3 className="font-heading font-bold text-lg text-slate-900 truncate pr-4 tracking-tight">
                    {loading ? "Načítám..." : data?.name}
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                ) : data ? (
                    <div className="pb-8">
                        {/* Image Hero */}
                        {data.image_url && (
                            <div className="relative h-64 w-full">
                                <img
                                    src={data.image_url}
                                    alt={data.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    {type === 'poi' && data.category && (
                                        <span className="px-3 py-1 bg-emerald-600/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                                            {data.category.name}
                                        </span>
                                    )}

                                    {data.review_count > 0 && (
                                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                                            <Star size={14} className="text-amber-500 fill-amber-500" />
                                            <span className="font-bold text-slate-900 text-xs">{data.review}</span>
                                            <span className="text-slate-500 text-[10px]">({data.review_count})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="px-5 pt-6 space-y-8">

                            {/* Actions / Links */}
                            <div className="flex flex-wrap gap-3">
                                {(data.website || data.web) && (
                                    <a
                                        href={data.website || data.web}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium text-sm rounded-xl border border-slate-200 transition-colors"
                                    >
                                        <Globe size={16} /> Web
                                    </a>
                                )}
                                {(data.kudyznudy_url || data.url) && (
                                    <a
                                        href={data.kudyznudy_url || data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                        {data.kudyznudy_url ? "Kudy z nudy" : "Dokempu.cz"}
                                    </a>
                                )}
                                {data.price_list_url && (
                                    <a
                                        href={data.price_list_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-medium text-sm rounded-xl border border-slate-200 transition-colors"
                                    >
                                        <CreditCard size={16} /> Ceník
                                    </a>
                                )}
                            </div>

                            {/* POI Info Grid */}
                            {type === 'poi' && (
                                <div className="space-y-6">
                                    {(data.price || data.discounted_price || data.time_required) && (
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                            {(data.price || data.discounted_price) && (
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600 shadow-sm shrink-0 h-fit">
                                                        <Ticket size={18} />
                                                    </div>
                                                    <div className="flex-1 space-y-2 pt-1">
                                                        {data.price && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-700 font-medium text-sm">Vstupné dospělí</span>
                                                                <span className="font-heading font-bold text-slate-900">{data.price} Kč</span>
                                                            </div>
                                                        )}
                                                        {data.discounted_price && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-700 font-medium text-sm">Zvýhodněné</span>
                                                                <span className="font-heading font-bold text-emerald-600">{data.discounted_price} Kč</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {data.time_required && (
                                                <div className={`flex gap-3 ${data.price || data.discounted_price ? 'pt-4 border-t border-slate-200/60' : ''}`}>
                                                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600 shadow-sm shrink-0 h-fit">
                                                        <Hourglass size={18} />
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center pt-1">
                                                        <span className="text-slate-700 font-medium text-sm">Časová náročnost</span>
                                                        <span className="text-slate-900 font-bold font-heading">{data.time_required} hod.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {data.opening_hours && data.opening_hours.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-3">
                                                <Clock size={18} className="text-emerald-600" /> Otevírací doba
                                            </h4>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                                {data.opening_hours.map((oh: any, idx: number) => (
                                                    <OpeningHoursItem key={idx} oh={oh} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CAMP Info Grid */}
                            {type === 'camp' && (
                                <div className="space-y-6">
                                    {(data.operating_time_month_from || data.accept_cards !== undefined) && (
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                            {data.operating_time_month_from && (
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600 shadow-sm shrink-0 h-fit">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center pt-1">
                                                        <span className="text-slate-700 font-medium text-sm">Sezóna</span>
                                                        <span className="text-slate-900 font-heading font-bold">
                                                            {data.operating_time_day_from}.{data.operating_time_month_from}. - {data.operating_time_day_to}.{data.operating_time_month_to}.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {data.accept_cards !== undefined && (
                                                <div className={`flex gap-3 ${data.operating_time_month_from ? 'pt-4 border-t border-slate-200/60' : ''}`}>
                                                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600 shadow-sm shrink-0 h-fit">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center pt-1">
                                                        <span className="text-slate-700 font-medium text-sm">Platba kartou</span>
                                                        <span className={`font-heading font-bold ${data.accept_cards === "1" ? "text-emerald-600" : "text-slate-500"}`}>
                                                            {data.accept_cards === "1" ? "Ano" : "Ne"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {data.accommodation_types && data.accommodation_types.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-3">
                                                <Tent size={18} className="text-emerald-600" /> Ubytování
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {data.accommodation_types.map((acc: any) => (
                                                    <span key={acc.id} className="px-3 py-1.5 bg-white border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl shadow-sm">
                                                        {acc.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {data.service && data.service.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-3">
                                                <Info size={18} className="text-emerald-600" /> Služby
                                            </h4>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {data.service.map((svc: any) => (
                                                    <li key={svc.id} className="text-sm text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                                                        <div className="mt-1.5 min-w-[6px] h-1.5 bg-emerald-400 rounded-full"></div>
                                                        <span className="leading-snug">{svc.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common: Equipment */}
                            {data.equipment && data.equipment.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-3">Vybavení</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.equipment.map((eq: any) => (
                                            <span key={eq.id} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                {eq.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Labels/Tags */}
                            {(data.labels || data.tags) && (
                                <div className="border-t border-slate-100 pt-6">
                                    <div className="flex flex-wrap gap-2">
                                        {[...(data.labels || []), ...(data.tags || [])].map((tag: any) => (
                                            <span key={tag.id} className="text-xs text-slate-400 hover:text-emerald-600 transition-colors cursor-default">
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
                        <Info size={48} className="mb-4 opacity-20" />
                        <p>Vyberte bod na mapě pro zobrazení detailů.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailSidebar;
