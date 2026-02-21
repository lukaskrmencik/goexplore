import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from "react";
import { useRouteDate } from "./hooks/useRouteDate";
import type { RouteDateEditorHandle, RouteEditorProps } from "../../../types/editor";
import { Calendar, Clock, Sun, Moon } from "lucide-react";
import Toast from "../../../components/ui/Toast";
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
        error,
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
        <div className="w-full h-full flex flex-col md:flex-row bg-white overflow-hidden relative">

            {/* LEFT PANEL: Compact Inputs */}
            <div className="flex-1 flex flex-col justify-center p-6 z-10 overflow-y-auto">
                <div className="max-w-md mx-auto w-full space-y-8">

                    {/* Header */}
                    <div className="space-y-3 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 tracking-tight">
                            Kdy vyrážíme?
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Naplánuj si čas startu a cíle.
                        </p>
                    </div>

                    {/* Compact Inputs Visualization */}
                    <div className="flex flex-col gap-4">

                        {/* Start Button */}
                        <button
                            onClick={() => { setActiveField('start'); setIsPickerOpen(true); }}
                            className={`group w-full text-left p-5 rounded-3xl border-2 transition-all relative overflow-hidden flex items-center gap-5 ${activeField === 'start'
                                ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10'
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex-none flex items-center justify-center transition-colors ${activeField === 'start' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                <Sun size={24} />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <span className={`text-xs font-bold uppercase tracking-widest ${activeField === 'start' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    Začátek
                                </span>
                                {startDate ? (
                                    <div className="text-2xl font-heading font-bold text-slate-900">
                                        {format(new Date(startDate), "d. MMMM, HH:mm", { locale: cs })}
                                    </div>
                                ) : (
                                    <div className="text-2xl font-heading font-bold text-slate-300">
                                        Vyber začátek
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Duration Pill (Inline) */}
                        {duration && (
                            <div className="flex justify-center">
                                <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                                    <Clock size={14} className="text-amber-500" />
                                    {duration}
                                </div>
                            </div>
                        )}

                        {/* End Button */}
                        <button
                            onClick={() => { setActiveField('end'); setIsPickerOpen(true); }}
                            className={`group w-full text-left p-5 rounded-3xl border-2 transition-all relative overflow-hidden flex items-center gap-5 ${activeField === 'end'
                                ? 'bg-rose-50 border-rose-500 shadow-xl shadow-rose-500/10'
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex-none flex items-center justify-center transition-colors ${activeField === 'end' ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                                <Moon size={24} />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <span className={`text-xs font-bold uppercase tracking-widest ${activeField === 'end' ? 'text-rose-500' : 'text-slate-400'}`}>
                                    Konec
                                </span>
                                {endDate ? (
                                    <div className="text-2xl font-heading font-bold text-slate-900">
                                        {format(new Date(endDate), "d. MMMM, HH:mm", { locale: cs })}
                                    </div>
                                ) : (
                                    <div className="text-2xl font-heading font-bold text-slate-300">
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
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ${isPickerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsPickerOpen(false)}
            />

            {/* RIGHT PANEL: Sidebar Calendar & Custom Time Picker */}
            <div className={`
                fixed md:static inset-x-0 bottom-0 top-auto z-[100] 
                flex flex-col h-[85dvh] md:h-auto md:w-[380px] 
                bg-white md:bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 
                rounded-t-[32px] md:rounded-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none
                transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                ${isPickerOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
            `}>

                {/* Mobile Handle / Header */}
                <div className="md:hidden flex items-center justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-2" />
                </div>

                {/* 1. Date Picker Section */}
                <div className="p-3 md:p-6 border-b border-slate-100 flex-none">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Calendar size={16} className="text-slate-400" />
                            Datum
                        </h3>
                        <button
                            onClick={() => setIsPickerOpen(false)}
                            className="text-sm font-bold text-emerald-600 md:hidden bg-emerald-50 px-3 py-1 rounded-full"
                        >
                            Hotovo
                        </button>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 datepicker-sidebar-wrapper flex justify-center">
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
                <div className="flex-1 flex flex-col min-h-0 pb-6 safe-area-bottom">
                    <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Clock size={16} className="text-slate-400" />
                            Čas
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-32 md:pb-8">
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                            {timeSlots.map(time => {
                                const isSelected = activeDateObj && format(activeDateObj, 'HH:mm') === time;
                                const isCurrentHour = activeDateObj && format(activeDateObj, 'HH') === time.split(':')[0];

                                return (
                                    <button
                                        key={time}
                                        id={`time-slot-${activeField}-${time}`}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`
                                            px-2 py-2 rounded-xl text-sm font-bold transition-all
                                            ${isSelected
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-500 ring-offset-2'
                                                : isCurrentHour
                                                    ? 'bg-slate-200 text-slate-800'
                                                    : 'bg-white border border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                                            }
                                        `}
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
