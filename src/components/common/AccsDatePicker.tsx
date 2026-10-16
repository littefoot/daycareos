import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw,
  X
} from 'lucide-react';

export interface AccsDatePickerProps {
  value: string; // ISO date string 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  mode?: 'birthdate' | 'future' | 'general';
  align?: 'left' | 'right' | 'auto';
  className?: string;
  ariaLabel?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type PickerView = 'calendar' | 'years' | 'months';

export const AccsDatePicker: React.FC<AccsDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  required = false,
  disabled = false,
  minYear = 2014,
  maxYear = new Date().getFullYear() + 3,
  mode = 'general',
  align = 'auto',
  className = '',
  ariaLabel = 'Select date'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month
  const initialDate = value && !isNaN(Date.parse(value)) ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [inputValue, setInputValue] = useState<string>(value || '');

  // Keep input text in sync when external value changes
  useEffect(() => {
    setInputValue(value || '');
    if (value && !isNaN(Date.parse(value))) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Reset to calendar view when closing
  useEffect(() => {
    if (!isOpen) {
      setPickerView('calendar');
    }
  }, [isOpen]);

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle typing directly in text field
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // If matches YYYY-MM-DD and is valid, trigger onChange
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parsed = new Date(val + 'T00:00:00');
      if (!isNaN(parsed.getTime())) {
        onChange(val);
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    } else if (val === '') {
      onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange('');
  };

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (year: number, monthZeroIndexed: number, day: number): string => {
    const mm = String(monthZeroIndexed + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatYMD(viewYear, viewMonth, day);
    setInputValue(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  // Year navigation with < and >
  const currentYear = new Date().getFullYear();
  const calculatedMinYear = mode === 'birthdate' ? currentYear - 13 : minYear;
  const calculatedMaxYear = mode === 'birthdate' ? currentYear : maxYear;

  const prevYear = () => {
    setViewYear(prev => Math.max(calculatedMinYear, prev - 1));
  };

  const nextYear = () => {
    setViewYear(prev => Math.min(calculatedMaxYear, prev + 1));
  };

  // Month navigation with < and >
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => Math.max(calculatedMinYear, prev - 1));
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => Math.min(calculatedMaxYear, prev + 1));
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Generate Year Options list for matrix view
  const yearOptions: number[] = [];
  for (let y = calculatedMaxYear; y >= calculatedMinYear; y--) {
    yearOptions.push(y);
  }

  // Calculate calendar grid for viewYear & viewMonth
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Selected date components
  let selY: number | null = null;
  let selM: number | null = null;
  let selD: number | null = null;
  if (value && !isNaN(Date.parse(value))) {
    const selDate = new Date(value + 'T00:00:00');
    selY = selDate.getFullYear();
    selM = selDate.getMonth();
    selD = selDate.getDate();
  }

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  // Position alignment class
  const alignClass = align === 'right' 
    ? 'right-0' 
    : align === 'auto' 
    ? 'left-0 sm:left-auto sm:right-0' 
    : 'left-0';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input Display Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          onFocus={() => { if (!disabled) setIsOpen(true); }}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          aria-label={ariaLabel}
          className={`w-full p-2.5 pr-16 rounded-xl font-medium transition-all ${
            disabled
              ? 'bg-slate-100 text-slate-600 border border-slate-300 cursor-not-allowed'
              : 'bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-slate-900 shadow-sm'
          }`}
        />

        {!disabled && (
          <div className="absolute right-2 flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear date"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              title="Open calendar picker"
              className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        )}
      </div>

      {/* Popover Calendar Container */}
      {!disabled && isOpen && (
        <div className={`absolute ${alignClass} mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl border-2 border-slate-900 shadow-neo p-4 animate-in fade-in zoom-in-95 duration-100 select-none`}>
          
          {/* 1. TOP TIER: Prominent Larger Year Navigation with < and > */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-slate-100">
            <button
              type="button"
              onClick={prevYear}
              disabled={viewYear <= calculatedMinYear}
              className="p-2 rounded-xl border-2 border-slate-300 text-slate-800 hover:border-slate-900 hover:bg-orange-50 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-sm active:translate-y-0.5"
              title="Previous Year (Step Back 1 Year)"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Large Prominent Year Button */}
            <button
              type="button"
              onClick={() => setPickerView(prev => prev === 'years' ? 'calendar' : 'years')}
              className={`flex-1 py-1.5 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 group ${
                pickerView === 'years'
                  ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm'
                  : 'bg-orange-50/80 border-slate-900 text-slate-900 hover:bg-orange-100 shadow-neo-sm'
              }`}
              title="Click to view all years matrix"
            >
              <span className="text-base sm:text-lg font-black tracking-tight">
                {viewYear}
              </span>
              <ChevronDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={nextYear}
              disabled={viewYear >= calculatedMaxYear}
              className="p-2 rounded-xl border-2 border-slate-300 text-slate-800 hover:border-slate-900 hover:bg-orange-50 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-sm active:translate-y-0.5"
              title="Next Year (Step Forward 1 Year)"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 2. SECOND TIER: Month Navigation with < and > */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              disabled={pickerView !== 'calendar'}
              className={`p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-800 hover:bg-slate-100 transition-all ${
                pickerView !== 'calendar' ? 'invisible pointer-events-none' : ''
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={() => setPickerView(prev => prev === 'months' ? 'calendar' : 'months')}
              className={`flex-1 py-1 px-3 rounded-lg border text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1 ${
                pickerView === 'months'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
              title="Click to select month"
            >
              <span>{MONTH_NAMES[viewMonth]}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={nextMonth}
              disabled={pickerView !== 'calendar'}
              className={`p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-800 hover:bg-slate-100 transition-all ${
                pickerView !== 'calendar' ? 'invisible pointer-events-none' : ''
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* VIEW A: Full Year Matrix (When clicking the Year button) */}
          {pickerView === 'years' && (
            <div className="py-1 animate-in fade-in duration-100">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Year (1-Click Jump)
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto p-1">
                {yearOptions.map(y => {
                  const isCurrentView = y === viewYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y);
                        setPickerView('calendar');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-black border-2 transition-all ${
                        isCurrentView
                          ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm scale-102'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-800 hover:bg-orange-50'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW B: Month Matrix (When clicking the Month button) */}
          {pickerView === 'months' && (
            <div className="py-1 animate-in fade-in duration-100">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Month ({viewYear})
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1">
                {MONTH_SHORT.map((m, idx) => {
                  const isCurrentView = idx === viewMonth;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx);
                        setPickerView('calendar');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-black border-2 transition-all ${
                        isCurrentView
                          ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm scale-102'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-800 hover:bg-orange-50'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW C: Full Calendar Day Grid */}
          {pickerView === 'calendar' && (
            <>
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAY_NAMES.map(d => (
                  <span key={d} className="text-[10px] font-extrabold text-slate-400 py-0.5">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for days before 1st of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selY === viewYear && selM === viewMonth && selD === day;
                  const isToday = isCurrentMonthToday && today.getDate() === day;

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-orange-500 text-white font-black border-2 border-slate-900 shadow-neo-sm scale-105 z-10'
                          : isToday
                          ? 'border-2 border-orange-500 text-orange-600 font-extrabold bg-orange-50/50 hover:bg-orange-100'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {day}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* 3. Footer Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            {mode !== 'birthdate' ? (
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const formatted = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
                  setInputValue(formatted);
                  onChange(formatted);
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  setPickerView('calendar');
                  setIsOpen(false);
                }}
                className="text-orange-600 font-extrabold hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Today</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Child Birthdate</span>
            )}

            <div className="flex items-center gap-2">
              {pickerView !== 'calendar' && (
                <button
                  type="button"
                  onClick={() => setPickerView('calendar')}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-600 hover:text-slate-900"
                >
                  Back to Days
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccsDatePicker;
