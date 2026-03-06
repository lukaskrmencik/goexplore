import { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from "react";
import { useRouteDate } from ".././hooks/useRouteDate";
import type { RouteDateEditorHandle, RouteEditorProps } from "../../../../types/editor";
import { Calendar, Clock, RotateCcw, Snowflake } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { cs } from "date-fns/locale/cs";
import { format } from "date-fns";
import { isInSeason } from "../../../../utils/routeLengthEstimator";
import DateFieldButton from "../components/DateFieldButton/DateFieldButton";
import DurationPill from "../components/DurationPill/DurationPill";
import PaceInfoBox from "../components/PaceInfoBox/PaceInfoBox";
import TimePickerGrid from "../components/TimePickerGrid/TimePickerGrid";
import "./RouteDateEditor.css";

registerLocale("cs", cs);

const RouteDateEditor = forwardRef<RouteDateEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange, estimatedRoadKm = 0 }, ref) => {
    const {
        startDate,
        endDate,
        activeField,
        setActiveField,
        activeDateObj,
        startDateObj,
        endDateObj,
        handleSave,
        handleReset,
        handleDateSelect,
        handleTimeSelect,
        duration,
        durationInfo,
        paceInfo,
        timeSlots,
        filterDate,
        dayClassName,
        openToDate,
    } = useRouteDate(route, onUpdate, estimatedRoadKm);

    const [isPickerOpen, setIsPickerOpen] = useState(() => window.innerWidth >= 768);

    useEffect(() => {
        onChange?.();
    }, [startDate, endDate, onChange]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await handleSave();
        }
    }));

    useEffect(() => {
        const activeDateStr = activeField === 'start' ? startDate : endDate;
        if (!activeDateStr) return;

        const timeStr = format(new Date(activeDateStr), "HH:mm");
        const el = document.getElementById(`time-slot-${activeField}-${timeStr}`);

        if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [startDate, endDate, activeField]);

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    const renderDayContents = useCallback((day: number, date: Date | undefined) => {

        if (date && !isInSeason(date)) {
            return (
                <div className="day-off-season-content">
                    <span>{day}</span>
                    <Snowflake size={11} className="day-off-season-snowflake" />
                </div>
            );
        }
        return day;

    }, []);

    return (
        <div className="route-date-editor-container">

            <div className="route-date-editor-left-panel">
                <div className="route-date-editor-content-wrapper">

                    <div className="route-date-editor-header">
                        <h2 className="route-date-editor-title">Datum trasy</h2>
                        <button
                            className="route-date-editor-reset-btn"
                            onClick={handleReset}
                            title="Resetovat"
                            disabled={!startDate && !endDate}
                        >
                            <RotateCcw size={14} />
                            <span>Resetovat</span>
                        </button>
                    </div>

                    <div className="route-date-editor-inputs-group">
                        <DateFieldButton
                            fieldType="start"
                            isActive={activeField === 'start'}
                            dateString={startDate}
                            onClick={() => { setActiveField('start'); setIsPickerOpen(true); }}
                        />
                        <DurationPill duration={duration} durationInfo={durationInfo} />
                        <DateFieldButton
                            fieldType="end"
                            isActive={activeField === 'end'}
                            dateString={endDate}
                            onClick={() => { setActiveField('end'); setIsPickerOpen(true); }}
                        />
                    </div>

                    <PaceInfoBox paceInfo={paceInfo} />

                </div>
            </div>

            <div
                className={`route-date-editor-backdrop ${isPickerOpen ? 'route-date-editor-backdrop-open' : 'route-date-editor-backdrop-closed'}`}
                onClick={() => setIsPickerOpen(false)}
            />

            <div className={`route-date-editor-right-panel ${isPickerOpen ? 'route-date-editor-right-panel-open' : 'route-date-editor-right-panel-closed'}`}>

                <div className="route-date-editor-mobile-handle">
                    <div className="route-date-editor-mobile-handle-bar" />
                </div>

                <div className="route-date-editor-datepicker-section">
                    <div className="route-date-editor-datepicker-header">
                        <h3 className="route-date-editor-section-header-title">
                            <Calendar size={16} className="route-date-editor-section-header-icon" />
                            Datum
                        </h3>
                        <button
                            onClick={() => setIsPickerOpen(false)}
                            className="route-date-editor-done-btn"
                        >
                            Hotovo
                        </button>
                    </div>
                    <div className="route-date-editor-datepicker-container datepicker-sidebar-wrapper">
                        <DatePicker
                            selected={activeDateObj}
                            onChange={handleDateSelect}
                            inline
                            dateFormat="d. MMMM yyyy"
                            locale="cs"
                            minDate={activeField === 'end' ? (startDateObj || undefined) : undefined}
                            maxDate={activeField === 'start' ? (endDateObj || undefined) : undefined}
                            openToDate={openToDate}
                            calendarClassName="sidebar-datepicker"
                            dayClassName={dayClassName}
                            filterDate={filterDate}
                            renderDayContents={renderDayContents}
                        />
                    </div>
                </div>

                <div className="route-date-editor-timepicker-section">
                    <div className="route-date-editor-timepicker-header">
                        <h3 className="route-date-editor-section-header-title">
                            <Clock size={16} className="route-date-editor-section-header-icon" />
                            Čas
                        </h3>
                    </div>
                    <TimePickerGrid
                        timeSlots={timeSlots}
                        activeDateObj={activeDateObj}
                        activeField={activeField}
                        onTimeSelect={handleTimeSelect}
                    />
                </div>

            </div>

        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
});

export default RouteDateEditor;
