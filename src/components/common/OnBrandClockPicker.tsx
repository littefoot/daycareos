import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { 
  parseFlexibleTimeToMinutes, 
  normalizeTimeString, 
  formatToISOTimestamp 
} from '../../utils/timeUtils';

export interface OnBrandClockPickerProps {
  value: string;
  onChange: (formatted12h: string, isoTimestamp: string, totalMinutes: number) => void;
  label?: string;
  showPresets?: boolean;
  presetType?: 'arrival' | 'departure' | 'all';
  compact?: boolean;
}

export const OnBrandClockPicker: React.FC<OnBrandClockPickerProps> = ({
  value,
  onChange,
  label,
  showPresets = true,
  presetType = 'departure',
  compact = false
}) => {
  // Parse initial value into hours, minutes, meridian
  const totalMin = parseFlexibleTimeToMinutes(value) || 960; // Default 4:00 PM (960 min)
  const initialH24 = Math.floor(totalMin / 60) % 24;
  const initialH12 = initialH24 % 12 === 0 ? 12 : initialH24 % 12;
  const initialM = totalMin % 60;
  const initialMeridian: 'AM' | 'PM' = initialH24 >= 12 ? 'PM' : 'AM';

  const [selectedHour, setSelectedHour] = useState<number>(initialH12);
  const [selectedMinute, setSelectedMinute] = useState<number>(initialM);
  const [meridian, setMeridian] = useState<'AM' | 'PM'>(initialMeridian);

  // Sync internal state when external value changes
  useEffect(() => {
    const min = parseFlexibleTimeToMinutes(value);
    if (min > 0) {
      const h24 = Math.floor(min / 60) % 24;
      setSelectedHour(h24 % 12 === 0 ? 12 : h24 % 12);
      setSelectedMinute(min % 60);
      setMeridian(h24 >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  // Emit change when components update
  const emitChange = (h: number, m: number, med: 'AM' | 'PM') => {
    let h24 = h % 12;
    if (med === 'PM') h24 += 12;
    const computedTotalMin = h24 * 60 + m;
    const padM = String(m).padStart(2, '0');
    const formatted12h = `${h}:${padM} ${med}`;
    const isoTimestamp = formatToISOTimestamp(formatted12h);
    onChange(formatted12h, isoTimestamp, computedTotalMin);
  };

  // Hour Up & Down Handlers
  const handleHourUp = () => {
    const nextH = selectedHour === 12 ? 1 : selectedHour + 1;
    setSelectedHour(nextH);
    emitChange(nextH, selectedMinute, meridian);
  };

  const handleHourDown = () => {
    const prevH = selectedHour === 1 ? 12 : selectedHour - 1;
    setSelectedHour(prevH);
    emitChange(prevH, selectedMinute, meridian);
  };

  // Minute Up & Down Handlers (Steps cleanly by 5 minutes)
  const handleMinuteUp = () => {
    let nextM = Math.floor(selectedMinute / 5) * 5 + 5;
    if (nextM >= 60) nextM = 0;
    setSelectedMinute(nextM);
    emitChange(selectedHour, nextM, meridian);
  };

  const handleMinuteDown = () => {
    let prevM = Math.ceil(selectedMinute / 5) * 5 - 5;
    if (prevM < 0) prevM = 55;
    setSelectedMinute(prevM);
    emitChange(selectedHour, prevM, meridian);
  };

  const handleMeridianToggle = (med: 'AM' | 'PM') => {
    setMeridian(med);
    emitChange(selectedHour, selectedMinute, med);
  };

  const handlePresetSelect = (presetStr: string) => {
    const min = parseFlexibleTimeToMinutes(presetStr);
    const h24 = Math.floor(min / 60) % 24;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const m = min % 60;
    const med: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    setSelectedHour(h12);
    setSelectedMinute(m);
    setMeridian(med);
    emitChange(h12, m, med);
  };

  const arrivalPresets = ['7:30 AM', '8:00 AM', '8:15 AM', '8:30 AM', '9:00 AM'];
  const departurePresets = ['3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];

  const presetsToDisplay = presetType === 'arrival'
    ? arrivalPresets
    : presetType === 'departure'
    ? departurePresets
    : [...arrivalPresets.slice(0, 3), ...departurePresets.slice(0, 3)];

  const nowString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white border-2 border-slate-900 rounded-2xl p-3 sm:p-4 space-y-3 shadow-neo-sm">
      {label && (
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Touch Stepper
          </span>
        </div>
      )}

      {/* LARGE TOUCH ARROWS & DIGITAL SPINNER */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 py-1">
        {/* HOURS COLUMN */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Large Up Arrow */}
          <button
            type="button"
            onClick={handleHourUp}
            className="w-18 sm:w-22 h-11 sm:h-13 rounded-2xl border-2 border-slate-900 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-900 flex items-center justify-center shadow-neo-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Increase hour"
          >
            <ChevronUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </button>

          {/* Hour Value Display */}
          <div className="w-18 sm:w-22 h-16 sm:h-18 rounded-2xl border-2 border-slate-900 bg-white flex flex-col items-center justify-center select-none shadow-neo-sm">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none tracking-wider">
              {String(selectedHour).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">
              Hour
            </span>
          </div>

          {/* Large Down Arrow */}
          <button
            type="button"
            onClick={handleHourDown}
            className="w-18 sm:w-22 h-11 sm:h-13 rounded-2xl border-2 border-slate-900 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-900 flex items-center justify-center shadow-neo-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Decrease hour"
          >
            <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </button>
        </div>

        {/* COLON DIVIDER */}
        <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 select-none pb-2 animate-pulse">
          :
        </div>

        {/* MINUTES COLUMN */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Large Up Arrow */}
          <button
            type="button"
            onClick={handleMinuteUp}
            className="w-18 sm:w-22 h-11 sm:h-13 rounded-2xl border-2 border-slate-900 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-900 flex items-center justify-center shadow-neo-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Increase minutes"
          >
            <ChevronUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </button>

          {/* Minute Value Display */}
          <div className="w-18 sm:w-22 h-16 sm:h-18 rounded-2xl border-2 border-slate-900 bg-white flex flex-col items-center justify-center select-none shadow-neo-sm">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none tracking-wider">
              {String(selectedMinute).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">
              Minute
            </span>
          </div>

          {/* Large Down Arrow */}
          <button
            type="button"
            onClick={handleMinuteDown}
            className="w-18 sm:w-22 h-11 sm:h-13 rounded-2xl border-2 border-slate-900 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-900 flex items-center justify-center shadow-neo-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Decrease minutes"
          >
            <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </button>
        </div>

        {/* AM / PM COLUMN */}
        <div className="flex flex-col items-center justify-center gap-2 pl-1 sm:pl-2">
          <button
            type="button"
            onClick={() => handleMeridianToggle('AM')}
            className={`w-13 sm:w-15 h-11 sm:h-13 rounded-2xl border-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              meridian === 'AM'
                ? 'bg-slate-900 text-white border-slate-900 shadow-neo-sm scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            }`}
          >
            AM
          </button>

          <button
            type="button"
            onClick={() => handleMeridianToggle('PM')}
            className={`w-13 sm:w-15 h-11 sm:h-13 rounded-2xl border-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              meridian === 'PM'
                ? 'bg-slate-900 text-white border-slate-900 shadow-neo-sm scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* 1-TAP QUICK SHORTCUTS PILLS (Mobile Optimized) */}
      {showPresets && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1-Tap Common Times:
            </span>
            <button
              type="button"
              onClick={() => handlePresetSelect(nowString)}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
            >
              Current Time ({nowString})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {presetsToDisplay.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  normalizeTimeString(value) === preset
                    ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
