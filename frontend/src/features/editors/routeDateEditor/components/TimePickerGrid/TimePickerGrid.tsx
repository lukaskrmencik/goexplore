import { format } from "date-fns";
import './TimePickerGrid.css';

interface TimePickerGridProps {
    timeSlots: string[];
    activeDateObj: Date | null;
    activeField: 'start' | 'end';
    onTimeSelect: (time: string) => void;
}

const TimePickerGrid: React.FC<TimePickerGridProps> = ({ timeSlots, activeDateObj, activeField, onTimeSelect }) => {

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="route-date-editor-timepicker-grid-container">
            <div className="route-date-editor-timepicker-grid">
                {timeSlots.map(time => {
                    const isSelected = activeDateObj && format(activeDateObj, 'HH:mm') === time;
                    const isCurrentHour = activeDateObj && format(activeDateObj, 'HH') === time.split(':')[0];

                    const slotClass = isSelected
                        ? 'route-date-editor-time-slot-selected'
                        : isCurrentHour
                            ? 'route-date-editor-time-slot-current-hour'
                            : 'route-date-editor-time-slot-default';

                    return (
                        <button
                            key={time}
                            id={`time-slot-${activeField}-${time}`}
                            onClick={() => onTimeSelect(time)}
                            className={`route-date-editor-time-slot ${slotClass}`}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default TimePickerGrid;
