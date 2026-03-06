import React from 'react';
import './MobileTopHeader.css';
import { useNavigate } from 'react-router-dom';

const MobileTopHeader: React.FC = () => {
    const navigate = useNavigate();

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="mobile-header">
            <div className="logo-container" onClick={() => navigate('/')}>
                <img src="/goexplore_logo.svg" alt="GoExplore logo" className="logo-icon" />
                <span className="logo-text">GoExplore</span>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default MobileTopHeader;
