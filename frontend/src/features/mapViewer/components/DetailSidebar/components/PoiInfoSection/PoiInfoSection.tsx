import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PoiDetail, OpeningHours } from '../../../../../../types/mapViewer';
import './PoiInfoSection.css';

const CZECH_MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
const CZECH_DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const OpeningHoursItem: React.FC<{ oh: OpeningHours }> = ({ oh }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const monthFrom = CZECH_MONTHS[oh.month_from - 1] || oh.month_from;
    const monthTo = CZECH_MONTHS[oh.month_to - 1] || oh.month_to;

    const daysList = Object.entries(oh.days || {})
        .map(([dayNum, times]) => ({
            dayName: CZECH_DAYS[parseInt(dayNum) - 1] || dayNum,
            timeFrom: times.from ? times.from.substring(0, 5) : "",
            timeTo: times.to ? times.to.substring(0, 5) : "",
            dayNum: parseInt(dayNum),
        }))
        .sort((a, b) => a.dayNum - b.dayNum);

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}
    
    return (
        <div className="detail-sidebar-oh-item">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="detail-sidebar-oh-btn"
            >
                <div className="detail-sidebar-oh-btn-text">{monthFrom} - {monthTo}</div>
                {isExpanded
                    ? <ChevronUp size={16} className="detail-sidebar-oh-icon-open" />
                    : <ChevronDown size={16} className="detail-sidebar-oh-icon-closed" />
                }
            </button>
            {isExpanded && (
                <div className="detail-sidebar-oh-content">
                    {daysList.map((dayItem, idx) => (
                        <div key={idx} className="detail-sidebar-oh-row">
                            <span className="detail-sidebar-oh-day">{dayItem.dayName}</span>
                            <span className="detail-sidebar-oh-time">{dayItem.timeFrom} - {dayItem.timeTo}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PoiInfoSectionProps {
    data: PoiDetail;
}

const PoiInfoSection: React.FC<PoiInfoSectionProps> = ({ data }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {(data.price || data.discounted_price || data.time_required) && (
            <div className="detail-sidebar-info-card">
                {(data.price || data.discounted_price) && (
                    <div className="detail-sidebar-info-row">
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
                <h4 className="detail-sidebar-section-title">Otevírací doba</h4>
                <div className="detail-sidebar-info-card">
                    {data.opening_hours.map((oh, idx) => (
                        <OpeningHoursItem key={idx} oh={oh} />
                    ))}
                </div>
            </div>
        )}
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default PoiInfoSection;
