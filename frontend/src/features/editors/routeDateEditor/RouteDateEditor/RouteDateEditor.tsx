import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from "react";
import { useRouteDate } from ".././hooks/useRouteDate";
import type { RouteDateEditorHandle, RouteEditorProps } from "../../../../types/editor";
import { Calendar, Clock, Sun, Moon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { cs } from "date-fns/locale/cs";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import "./RouteDateEditor.css";

registerLocale("cs", cs);

const RouteDateEditor = forwardRef<RouteDateEditorHandle, RouteEditorProps>(({ route, onUpdate, onChange }, ref) => {
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleSave,
        duration
    } = useRouteDate(route, onUpdate);

    const [activeField, setActiveField] = useState<'start' | 'end'>('start');
    const [isPickerOpen, setIsPickerOpen] = useState(true); // Default open on desktop, controlled on mobile

    useEffect(() => {
        onChange?.();
    }, [startDate, endDate, onChange]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await handleSave();
        }
    }));

    const getStartDateObj = () => startDate ? new Date(startDate) : null;
    const getEndDateObj = () => endDate ? new Date(endDate) : null;

    const activeDateObj = activeField === 'start' ? getStartDateObj() : getEndDateObj();

    const handleDateSelect = (date: Date | null) => {
        if (!date) return;

        // Preserve time from existing selection if possible, otherwise keep default (current time or 00:00 implies start of day?)
        // Actually, if we pick a date, we probably want to keep the CURRENTLY selected time if it exists.
        // If it's a fresh selection, maybe default to 8:00 or Now? Let's keep it simple: date changes date, time changes time.

        let newDate = new Date(date);
        if (activeDateObj) {
            newDate = setHours(newDate, activeDateObj.getHours());
            newDate = setMinutes(newDate, activeDateObj.getMinutes());
        } else {
            // New entry, default to something reasonable or just current time
            const now = new Date();
            newDate = setHours(newDate, now.getHours());
            newDate = setMinutes(newDate, now.getMinutes());
        }

        updateDate(newDate);

        // Auto-advance logic for UX
        if (activeField === 'start' && (!endDate || new Date(endDate) < newDate)) {
            // If we just set start, and end is invalid, maybe we don't auto-switch yet, 
            // user might want to set time first. Let's stay on start to let them pick time.
        }
    };

    const handleTimeSelect = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        let newDate = activeDateObj ? new Date(activeDateObj) : new Date();
        newDate = setHours(newDate, hours);
        newDate = setMinutes(newDate, minutes);

        updateDate(newDate);
    };

    const updateDate = (date: Date) => {
        const isoDate = format(date, "yyyy-MM-dd'T'HH:mm");
        if (activeField === 'start') {
            setStartDate(isoDate);
        } else {
            setEndDate(isoDate);
        }
    };

    // Generate time slots (15 min intervals)
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = 0; i < 24 * 4; i++) {
            const h = Math.floor(i / 4);
            const m = (i % 4) * 15;
            const timeLabel = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            slots.push(timeLabel);
        }
        return slots;
    }, []);

    // Scroll selected time into view on mount or change
    useEffect(() => {
        if (activeDateObj) {
            const timeStr = format(activeDateObj, "HH:mm");
            const el = document.getElementById(`time-slot-${activeField}-${timeStr}`);
            if (el) {
                el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    }, [activeDateObj, activeField]);

    // Range visualization logic
    const dayClassName = (date: Date) => {
        const d = startOfDay(date).getTime();
        const start = startDate ? startOfDay(new Date(startDate)).getTime() : 0;
        const end = endDate ? startOfDay(new Date(endDate)).getTime() : 0;

        // Range (requires both)
        if (start && end && d > start && d < end) {
            return "range-intermediate";
        }

        // Start Marker (always show if we have a start date and are not editing it, OR if we are editing end)
        // Actually simpler: Show start marker if it exists and is NOT the currently active date (which gets 'selected' class)
        // But activeField === 'end' means we want to see start as a marker.
        if (start && d === start && activeField === 'end') {
            return "range-start-marker";
        }

        // End Marker (show if it exists and we are editing start)
        if (end && d === end && activeField === 'start') {
            return "range-end-marker";
        }

        return "";
    };



    // When editing end date but none is selected, show the calendar starting from start date month
    const openToDate = (activeField === 'end' && !activeDateObj && startDate)
        ? new Date(startDate)
        : undefined;

    return (
        <div className="route-date-editor-container">

            {/* LEFT PANEL: Compact Inputs */}
            <div className="route-date-editor-left-panel">
                <div className="route-date-editor-content-wrapper">

                    {/* Header */}
                    <div className="route-date-editor-header">
                        <h2 className="route-date-editor-title">
                            Kdy vyrážíme?
                        </h2>
                        <p className="route-date-editor-subtitle">
                            Naplánuj si čas startu a cíle.
                        </p>
                    </div>

                    {/* Compact Inputs Visualization */}
                    <div className="route-date-editor-inputs-group">

                        {/* Start Button */}
                        <button
                            onClick={() => { setActiveField('start'); setIsPickerOpen(true); }}
                            className={`route-date-editor-button ${activeField === 'start'
                                ? 'route-date-editor-button-start-active'
                                : 'route-date-editor-button-start-inactive'
                                }`}
                        >
                            <div className={`route-date-editor-icon-wrapper-start ${activeField === 'start' ? 'route-date-editor-icon-start-active' : 'route-date-editor-icon-start-inactive'}`}>
                                <Sun size={24} />
                            </div>
                            <div className="route-date-editor-button-content">
                                <span className={`route-date-editor-button-label ${activeField === 'start' ? 'route-date-editor-label-start-active' : 'route-date-editor-label-start-inactive'}`}>
                                    Začátek
                                </span>
                                {startDate ? (
                                    <div className="route-date-editor-button-value">
                                        {format(new Date(startDate), "d. MMMM, HH:mm", { locale: cs })}
                                    </div>
                                ) : (
                                    <div className="route-date-editor-button-placeholder">
                                        Vyber začátek
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Duration Pill (Inline) */}
                        {duration && (
                            <div className="route-date-editor-duration-wrapper">
                                <div className="route-date-editor-duration-pill">
                                    <Clock size={14} className="route-date-editor-duration-icon" />
                                    {duration}
                                </div>
                            </div>
                        )}

                        {/* End Button */}
                        <button
                            onClick={() => { setActiveField('end'); setIsPickerOpen(true); }}
                            className={`route-date-editor-button ${activeField === 'end'
                                ? 'route-date-editor-button-end-active'
                                : 'route-date-editor-button-end-inactive'
                                }`}
                        >
                            <div className={`route-date-editor-icon-wrapper-end ${activeField === 'end' ? 'route-date-editor-icon-end-active' : 'route-date-editor-icon-end-inactive'}`}>
                                <Moon size={24} />
                            </div>
                            <div className="route-date-editor-button-content">
                                <span className={`route-date-editor-button-label ${activeField === 'end' ? 'route-date-editor-label-end-active' : 'route-date-editor-label-end-inactive'}`}>
                                    Konec
                                </span>
                                {endDate ? (
                                    <div className="route-date-editor-button-value">
                                        {format(new Date(endDate), "d. MMMM, HH:mm", { locale: cs })}
                                    </div>
                                ) : (
                                    <div className="route-date-editor-button-placeholder">
                                        Vyber konec
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Error Toast Placeholder */}
                    {/* error is now handled by the parent MapViewerPage toast */}
                </div>
            </div>

            {/* Mobile Backdrop */}
            <div
                className={`route-date-editor-backdrop ${isPickerOpen ? 'route-date-editor-backdrop-open' : 'route-date-editor-backdrop-closed'}`}
                onClick={() => setIsPickerOpen(false)}
            />

            {/* RIGHT PANEL: Sidebar Calendar & Custom Time Picker */}
            <div className={`route-date-editor-right-panel ${isPickerOpen ? 'route-date-editor-right-panel-open' : 'route-date-editor-right-panel-closed'}`}>

                {/* Mobile Handle / Header */}
                <div className="route-date-editor-mobile-handle">
                    <div className="route-date-editor-mobile-handle-bar" />
                </div>

                {/* 1. Date Picker Section */}
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
                            minDate={activeField === 'end' ? (getStartDateObj() || undefined) : undefined}
                            maxDate={activeField === 'start' ? (getEndDateObj() || undefined) : undefined}
                            openToDate={openToDate}
                            calendarClassName="sidebar-datepicker"
                            dayClassName={dayClassName}
                        />
                    </div>
                </div>

                {/* 2. Custom Time Picker Section */}
                <div className="route-date-editor-timepicker-section">
                    <div className="route-date-editor-timepicker-header">
                        <h3 className="route-date-editor-section-header-title">
                            <Clock size={16} className="route-date-editor-section-header-icon" />
                            Čas
                        </h3>
                    </div>

                    <div className="route-date-editor-timepicker-grid-container">
                        <div className="route-date-editor-timepicker-grid">
                            {timeSlots.map(time => {
                                const isSelected = activeDateObj && format(activeDateObj, 'HH:mm') === time;
                                const isCurrentHour = activeDateObj && format(activeDateObj, 'HH') === time.split(':')[0];

                                return (
                                    <button
                                        key={time}
                                        id={`time-slot-${activeField}-${time}`}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`route-date-editor-time-slot ${isSelected
                                            ? 'route-date-editor-time-slot-selected'
                                            : isCurrentHour
                                                ? 'route-date-editor-time-slot-current-hour'
                                                : 'route-date-editor-time-slot-default'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
});

export default RouteDateEditor;
