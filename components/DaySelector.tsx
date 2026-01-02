import React from 'react';
import { Check } from 'lucide-react';

interface DaySelectorProps {
    selectedDays: string[];
    onDaysChange: (days: string[]) => void;
    teacherAvailability?: string[]; // Days teacher is available
}

const DaySelector: React.FC<DaySelectorProps> = ({
    selectedDays,
    onDaysChange,
    teacherAvailability = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}) => {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const toggleDay = (day: string) => {
        if (!teacherAvailability.includes(day)) return;

        if (selectedDays.includes(day)) {
            onDaysChange(selectedDays.filter(d => d !== day));
        } else {
            onDaysChange([...selectedDays, day]);
        }
    };

    const selectAllWeekdays = () => {
        const availableWeekdays = weekdays.filter(day => teacherAvailability.includes(day));
        onDaysChange(availableWeekdays);
    };

    const selectAllDays = () => {
        onDaysChange(teacherAvailability);
    };

    const clearAll = () => {
        onDaysChange([]);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Select Class Days</h3>
                <p className="text-slate-500 font-medium">Choose which days you want to have classes</p>
            </div>

            {/* Day buttons */}
            <div className="grid grid-cols-7 gap-3">
                {allDays.map((day) => {
                    const isAvailable = teacherAvailability.includes(day);
                    const isSelected = selectedDays.includes(day);

                    return (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            disabled={!isAvailable}
                            className={`relative aspect-square rounded-2xl font-black text-sm transition-all ${!isAvailable
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-xs mb-1">{day}</span>
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-blue-600" />
                                    </div>
                                )}
                                {!isAvailable && (
                                    <span className="text-[8px] text-slate-400">N/A</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                <button
                    onClick={selectAllWeekdays}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                    Select Weekdays
                </button>
                <button
                    onClick={selectAllDays}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                    Select All Days
                </button>
                {selectedDays.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Selected days summary */}
            {selectedDays.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-green-800 mb-1">
                                {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                                {selectedDays.join(', ')}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-green-700">
                                {selectedDays.length}
                            </p>
                            <p className="text-xs text-green-600 font-bold">classes/week</p>
                        </div>
                    </div>
                </div>
            )}

            {selectedDays.length === 0 && (
                <div className="text-center text-slate-400 text-sm font-medium py-4">
                    Select at least one day to continue
                </div>
            )}
        </div>
    );
};

export default DaySelector;
