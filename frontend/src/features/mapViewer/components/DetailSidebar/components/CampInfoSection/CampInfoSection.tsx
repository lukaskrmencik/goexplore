import React from 'react';
import type { CampDetail } from '../../../../../../types/mapViewer';
import './CampInfoSection.css';

interface CampInfoSectionProps {
    data: CampDetail;
}

{/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

const CampInfoSection: React.FC<CampInfoSectionProps> = ({ data }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {(data.operating_time_month_from || data.accept_cards !== undefined) && (
            <div className="detail-sidebar-info-card">
                {data.operating_time_month_from && (
                    <div className="detail-sidebar-info-row">
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
                <h4 className="detail-sidebar-section-title">Ubytování</h4>
                <div className="detail-sidebar-chips-row">
                    {data.accommodation_types.map(acc => (
                        <span key={acc.id} className="detail-sidebar-chip-acc">{acc.name}</span>
                    ))}
                </div>
            </div>
        )}
        {data.service && data.service.length > 0 && (
            <div>
                <h4 className="detail-sidebar-section-title">Služby</h4>
                <ul className="detail-sidebar-services-list">
                    {data.service.map(svc => (
                        <li key={svc.id} className="detail-sidebar-service-item">
                            <div className="detail-sidebar-service-dot"></div>
                            <span style={{ lineHeight: 1.375 }}>{svc.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default CampInfoSection;
