import React, { useEffect, useState } from 'react';
import { X, Clock, Star, Globe, Calendar, CreditCard, Tent, Info, ExternalLink, ChevronDown, ChevronUp, Ticket, Hourglass } from 'lucide-react';
import { fetchPoiDetail } from '../../../../services/poiApiService';
import { fetchCampDetail } from '../../../../services/campsApiService';
import "./DetailSidebar.css";

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
        <div className="detail-sidebar-oh-item">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="detail-sidebar-oh-btn group"
            >
                <div className="detail-sidebar-oh-btn-text">
                    {monthFrom} - {monthTo}
                </div>
                {isOpen ? <ChevronUp size={16} className="detail-sidebar-oh-icon-open" /> : <ChevronDown size={16} className="detail-sidebar-oh-icon-closed" />}
            </button>

            {isOpen && (
                <div className="detail-sidebar-oh-content">
                    {daysList.map((dayItem, dIdx) => (
                        <div key={dIdx} className="detail-sidebar-oh-row">
                            <span className="detail-sidebar-oh-day">{dayItem.dayName}</span>
                            <span className="detail-sidebar-oh-time">{dayItem.timeFrom} - {dayItem.timeTo}</span>
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
        <div className={`detail-sidebar-container ${isOpen ? 'detail-sidebar-container-open' : 'detail-sidebar-container-closed'}`}>
            {/* Header */}
            <div className="detail-sidebar-header">
                <h3 className="detail-sidebar-title">
                    {loading ? "Načítám..." : data?.name}
                </h3>
                <button
                    onClick={onClose}
                    className="detail-sidebar-close-btn"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="detail-sidebar-content-area w-full pb-8">
                {loading ? (
                    <div className="detail-sidebar-loading-wrapper">
                        <div className="detail-sidebar-loading-spinner"></div>
                    </div>
                ) : data ? (
                    <div>
                        {/* Image Hero */}
                        {data.image_url && (
                            <div className="detail-sidebar-hero">
                                <img
                                    src={data.image_url}
                                    alt={data.name}
                                    className="detail-sidebar-hero-img"
                                />
                                <div className="detail-sidebar-hero-gradient"></div>

                                <div className="detail-sidebar-hero-badges">
                                    {type === 'poi' && data.category && (
                                        <span className="detail-sidebar-category-badge">
                                            {data.category.name}
                                        </span>
                                    )}

                                    {data.review_count > 0 && (
                                        <div className="detail-sidebar-review-badge">
                                            <Star size={14} className="text-amber-500 fill-amber-500" />
                                            <span className="detail-sidebar-review-score">{data.review}</span>
                                            <span className="detail-sidebar-review-count">({data.review_count})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="detail-sidebar-body">

                            {/* Actions / Links */}
                            <div className="detail-sidebar-actions-row">
                                {(data.website || data.web) && (
                                    <a
                                        href={data.website || data.web}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-sidebar-action-btn detail-sidebar-action-web"
                                    >
                                        <Globe size={16} /> Web
                                    </a>
                                )}
                                {(data.kudyznudy_url || data.url) && (
                                    <a
                                        href={data.kudyznudy_url || data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-sidebar-action-btn detail-sidebar-action-ext"
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
                                        className="detail-sidebar-action-btn detail-sidebar-action-price"
                                    >
                                        <CreditCard size={16} /> Ceník
                                    </a>
                                )}
                            </div>

                            {/* POI Info Grid */}
                            {type === 'poi' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {(data.price || data.discounted_price || data.time_required) && (
                                        <div className="detail-sidebar-info-card">
                                            {(data.price || data.discounted_price) && (
                                                <div className="detail-sidebar-info-row">
                                                    <div className="detail-sidebar-info-icon">
                                                        <Ticket size={18} />
                                                    </div>
                                                    <div className="detail-sidebar-info-text-col">
                                                        {data.price && (
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <span className="detail-sidebar-info-label">Vstupné dospělí</span>
                                                                <span className="detail-sidebar-info-value">{data.price} Kč</span>
                                                            </div>
                                                        )}
                                                        {data.discounted_price && (
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <span className="detail-sidebar-info-label">Zvýhodněné</span>
                                                                <span className="detail-sidebar-info-value-emerald">{data.discounted_price} Kč</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {data.time_required && (
                                                <div className={`detail-sidebar-info-row ${data.price || data.discounted_price ? 'detail-sidebar-info-row-bordered' : ''}`}>
                                                    <div className="detail-sidebar-info-icon">
                                                        <Hourglass size={18} />
                                                    </div>
                                                    <div className="detail-sidebar-info-text-row">
                                                        <span className="detail-sidebar-info-label">Časová náročnost</span>
                                                        <span className="detail-sidebar-info-value">{data.time_required} hod.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {data.opening_hours && data.opening_hours.length > 0 && (
                                        <div>
                                            <h4 className="detail-sidebar-section-title">
                                                <Clock size={18} className="detail-sidebar-section-title-icon" /> Otevírací doba
                                            </h4>
                                            <div className="detail-sidebar-info-card">
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
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {(data.operating_time_month_from || data.accept_cards !== undefined) && (
                                        <div className="detail-sidebar-info-card">
                                            {data.operating_time_month_from && (
                                                <div className="detail-sidebar-info-row">
                                                    <div className="detail-sidebar-info-icon">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div className="detail-sidebar-info-text-row">
                                                        <span className="detail-sidebar-info-label">Sezóna</span>
                                                        <span className="detail-sidebar-info-value">
                                                            {data.operating_time_day_from}.{data.operating_time_month_from}. - {data.operating_time_day_to}.{data.operating_time_month_to}.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {data.accept_cards !== undefined && (
                                                <div className={`detail-sidebar-info-row ${data.operating_time_month_from ? 'detail-sidebar-info-row-bordered' : ''}`}>
                                                    <div className="detail-sidebar-info-icon">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div className="detail-sidebar-info-text-row">
                                                        <span className="detail-sidebar-info-label">Platba kartou</span>
                                                        <span className={data.accept_cards === "1" ? "detail-sidebar-info-value-emerald" : "detail-sidebar-info-value-slate"}>
                                                            {data.accept_cards === "1" ? "Ano" : "Ne"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {data.accommodation_types && data.accommodation_types.length > 0 && (
                                        <div>
                                            <h4 className="detail-sidebar-section-title">
                                                <Tent size={18} className="detail-sidebar-section-title-icon" /> Ubytování
                                            </h4>
                                            <div className="detail-sidebar-chips-row">
                                                {data.accommodation_types.map((acc: any) => (
                                                    <span key={acc.id} className="detail-sidebar-chip-acc">
                                                        {acc.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {data.service && data.service.length > 0 && (
                                        <div>
                                            <h4 className="detail-sidebar-section-title">
                                                <Info size={18} className="detail-sidebar-section-title-icon" /> Služby
                                            </h4>
                                            <ul className="detail-sidebar-services-list">
                                                {data.service.map((svc: any) => (
                                                    <li key={svc.id} className="detail-sidebar-service-item">
                                                        <div className="detail-sidebar-service-dot"></div>
                                                        <span style={{ lineHeight: 1.375 }}>{svc.name}</span>
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
                                    <h4 className="detail-sidebar-section-title" style={{ marginTop: 0, marginBottom: "0.75rem" }}>Vybavení</h4>
                                    <div className="detail-sidebar-chips-row">
                                        {data.equipment.map((eq: any) => (
                                            <span key={eq.id} className="detail-sidebar-chip-eq">
                                                {eq.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Labels/Tags */}
                            {(data.labels || data.tags) && (
                                <div className="detail-sidebar-tags-section">
                                    <div className="detail-sidebar-chips-row">
                                        {[...(data.labels || []), ...(data.tags || [])].map((tag: any) => (
                                            <span key={tag.id} className="detail-sidebar-tag-item">
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="detail-sidebar-empty-state">
                        <Info size={48} className="detail-sidebar-empty-icon" />
                        <p style={{ margin: 0 }}>Vyberte bod na mapě pro zobrazení detailů.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailSidebar;
