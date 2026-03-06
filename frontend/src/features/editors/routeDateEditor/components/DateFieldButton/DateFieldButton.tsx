import { format } from "date-fns";
import './DateFieldButton.css';
import { cs } from "date-fns/locale/cs";

interface DateFieldButtonProps {
    fieldType: 'start' | 'end';
    isActive: boolean;
    dateString: string;
    onClick: () => void;
}

const DateFieldButton: React.FC<DateFieldButtonProps> = ({ fieldType, isActive, dateString, onClick }) => {
    const label = fieldType === 'start' ? 'Začátek' : 'Konec';


    const buttonActiveClass = fieldType === 'start'
        ? (isActive ? 'route-date-editor-button-start-active' : 'route-date-editor-button-start-inactive')
        : (isActive ? 'route-date-editor-button-end-active' : 'route-date-editor-button-end-inactive');


    const labelActiveClass = fieldType === 'start'
        ? (isActive ? 'route-date-editor-label-start-active' : 'route-date-editor-label-start-inactive')
        : (isActive ? 'route-date-editor-label-end-active' : 'route-date-editor-label-end-inactive');


    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <button onClick={onClick} className={`route-date-editor-button ${buttonActiveClass}`}>
            <div className="route-date-editor-button-content">
                <span className={`route-date-editor-button-label ${labelActiveClass}`}>{label}</span>
                <span className="route-date-editor-button-separator">|</span>
                {dateString ? (
                    <span className="route-date-editor-button-datetime">
                        {format(new Date(dateString), "d. MMMM yyyy, HH:mm", { locale: cs })}
                    </span>
                ) : (
                    <span className="route-date-editor-button-placeholder">Vyber datum a čas</span>
                )}
            </div>
        </button>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default DateFieldButton;
