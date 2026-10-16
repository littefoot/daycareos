import React from 'react';
import { Clock } from 'lucide-react';

export interface HoursOfCareScheduleTableProps {
  formId?: string;
  isReadOnly?: boolean;
  selectedDays: string[];
  isEvening: boolean;
  onChange: (days: string[], isEvening: boolean) => void;
}

export const ScheduleDaysMultiselectField: React.FC<HoursOfCareScheduleTableProps> = ({
  formId: _formId,
  isReadOnly = false,
  selectedDays = ['MON', 'TUES', 'WED', 'THURS', 'FRI'],
  isEvening = false,
  onChange
}) => {
  const DAYS = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];

  const handleToggleDay = (day: string) => {
    if (isReadOnly) return;
    const next = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    onChange(next, isEvening);
  };

  const handleApplyPreset = (preset: 'cwelcc' | 'part_time' | 'all' | 'clear') => {
    if (isReadOnly) return;
    let next: string[] = [];
    if (preset === 'cwelcc') {
      next = ['MON', 'TUES', 'WED', 'THURS', 'FRI'];
    } else if (preset === 'part_time') {
      next = ['MON', 'WED', 'FRI'];
    } else if (preset === 'all') {
      next = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];
    }
    onChange(next, isEvening);
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-neo-sm sm:col-span-2">
      {/* Top Header matching Ministry Form 1 Document */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Hours of Care</h4>
          </div>
          <p className="text-[10px] text-slate-500">Ministry CCEYA required care schedule. Tap buttons to toggle active days:</p>
        </div>

        {/* [ ] Evening Care Checkbox */}
        <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-xs font-bold ${
          isReadOnly ? 'bg-slate-100 border-slate-300 cursor-not-allowed' :
          isEvening ? 'bg-orange-50 border-orange-500 text-orange-950 cursor-pointer shadow-sm' :
          'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 cursor-pointer'
        }`}>
          <input
            type="checkbox"
            disabled={isReadOnly}
            checked={isEvening}
            onChange={(e) => onChange(selectedDays, e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
          />
          <span>[ ] Evening</span>
        </label>
      </div>

      {/* Official 7-Day Ministry Interactive Buttons Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              disabled={isReadOnly}
              onClick={() => handleToggleDay(day)}
              className={`py-3 px-1 rounded-xl text-center font-black text-xs transition-all flex flex-col items-center justify-center gap-1.5 border-2 ${
                isReadOnly
                  ? isSelected
                    ? 'bg-slate-800 text-white border-slate-800 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : isSelected
                  ? 'bg-orange-500 text-white border-slate-900 shadow-neo-sm scale-105 hover:bg-orange-400'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-800 hover:bg-white'
              }`}
            >
              <span className="tracking-wider">{day}</span>
              <span className={`w-2.5 h-2.5 rounded-full border ${
                isSelected ? 'bg-white border-white' : 'bg-slate-200 border-slate-400'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Quick Presets */}
      {!isReadOnly && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400 font-bold text-[10px]">Quick Presets:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyPreset('cwelcc')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-950 text-slate-700 border border-slate-300 rounded-lg font-bold transition-colors"
            >
              ⚡ Mon–Fri (Full-Time CWELCC)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('part_time')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold transition-colors"
            >
              ⚡ Mon / Wed / Fri
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold transition-colors"
            >
              ⚡ All 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('clear')}
              className="px-2 py-1 text-slate-400 hover:text-red-600 text-[10px] font-bold"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
