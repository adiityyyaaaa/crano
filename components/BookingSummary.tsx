import React from 'react';
import { Calendar, Clock, Tag, TrendingUp } from 'lucide-react';

interface BookingSummaryProps {
    packageType: 'single' | 'weekly' | 'monthly';
    selectedDays: string[];
    selectedTime: string;
    teacherName: string;
    subject: string;
    pricePerClass: number;
    totalClasses: number;
    totalPrice: number;
    discountPercent: number;
    finalPrice: number;
    startDate: Date;
    onProceedToPayment: () => void;
    onBack: () => void;
    isProcessing?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
    packageType,
    selectedDays,
    selectedTime,
    teacherName,
    subject,
    pricePerClass,
    totalClasses,
    totalPrice,
    discountPercent,
    finalPrice,
    startDate,
    onProceedToPayment,
    onBack,
    isProcessing = false
}) => {
    const packageNames = {
        single: 'Single Class',
        weekly: 'Weekly Package',
        monthly: 'Monthly Package'
    };

    const getSchedulePreview = () => {
        const preview = [];
        let currentDate = new Date(startDate);
        const maxDays = packageType === 'weekly' ? 7 : packageType === 'monthly' ? 30 : 1;

        for (let i = 0; i < maxDays && preview.length < totalClasses; i++) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });

            if (selectedDays.includes(dayName)) {
                preview.push({
                    date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    day: dayName,
                    time: selectedTime
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return preview;
    };

    const schedulePreview = getSchedulePreview();
    const discountAmount = totalPrice - finalPrice;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Summary</h3>
                <p className="text-slate-500 font-medium">Review your booking details</p>
            </div>

            {/* Package Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-lg font-black text-slate-900">{packageNames[packageType]}</h4>
                        <p className="text-sm text-slate-600 font-medium">{subject} with {teacherName}</p>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm">
                        {totalClasses} {totalClasses === 1 ? 'Class' : 'Classes'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-slate-700 font-medium">
                            {selectedDays.join(', ')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <Clock size={16} className="text-blue-600" />
                        <span className="text-slate-700 font-medium">{selectedTime}</span>
                    </div>
                </div>
            </div>

            {/* Schedule Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center space-x-2">
                    <Calendar size={20} className="text-slate-600" />
                    <span>Class Schedule</span>
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {schedulePreview.map((session, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{session.day}, {session.date}</p>
                                    <p className="text-sm text-slate-500 font-medium">{session.time}</p>
                                </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                                Scheduled
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center space-x-2">
                    <Tag size={20} className="text-slate-600" />
                    <span>Pricing Details</span>
                </h4>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Base Price ({totalClasses} × ₹{pricePerClass})</span>
                        <span className="font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    {discountPercent > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                            <span className="font-medium flex items-center space-x-2">
                                <TrendingUp size={16} />
                                <span>Package Discount ({discountPercent}%)</span>
                            </span>
                            <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">Total Amount</span>
                            <span className="text-2xl font-black text-blue-600">
                                ₹{finalPrice.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {discountPercent > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <p className="text-sm font-bold text-green-700">
                                🎉 You're saving ₹{discountAmount.toLocaleString('en-IN')} with this package!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-black hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                <button
                    onClick={onProceedToPayment}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
            </div>

            {/* Terms */}
            <div className="text-center text-xs text-slate-400 font-medium">
                By proceeding, you agree to our terms and conditions
            </div>
        </div>
    );
};

export default BookingSummary;
