import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface PackageSelectorProps {
    teacherPrice: number;
    selectedPackage: 'single' | 'weekly' | 'monthly';
    onSelect: (packageType: 'single' | 'weekly' | 'monthly') => void;
}

const PackageSelector: React.FC<PackageSelectorProps> = ({ teacherPrice, selectedPackage, onSelect }) => {
    const packages = [
        {
            type: 'single' as const,
            name: 'Single Class',
            classes: 1,
            discount: 0,
            price: teacherPrice,
            savings: 0,
            description: 'Try one class',
            popular: false
        },
        {
            type: 'weekly' as const,
            name: 'Weekly Package',
            classes: 5,
            discount: 10,
            price: teacherPrice * 5 * 0.9,
            savings: teacherPrice * 5 * 0.1,
            description: 'Mon-Fri classes',
            popular: true
        },
        {
            type: 'monthly' as const,
            name: 'Monthly Package',
            classes: 20,
            discount: 20,
            price: teacherPrice * 20 * 0.8,
            savings: teacherPrice * 20 * 0.2,
            description: '~5 days/week × 4 weeks',
            popular: false
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Choose Your Package</h3>
                <p className="text-slate-500 font-medium">Select how you'd like to book classes</p>
            </div>

            <div className="space-y-4">{/* Changed from grid to vertical stack */}
                {packages.map((pkg) => (
                    <button
                        key={pkg.type}
                        onClick={() => onSelect(pkg.type)}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-left ${selectedPackage === pkg.type
                            ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                            }`}
                    >
                        {pkg.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-black flex items-center space-x-1">
                                    <Sparkles size={12} />
                                    <span>MOST POPULAR</span>
                                </span>
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-black text-slate-900">{pkg.name}</h4>
                                <p className="text-sm text-slate-500 font-medium">{pkg.description}</p>
                            </div>
                            {selectedPackage === pkg.type && (
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check size={16} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-slate-900">₹{Math.round(pkg.price).toLocaleString('en-IN')}</span>
                                {pkg.discount > 0 && (
                                    <span className="text-sm text-slate-400 line-through">₹{(teacherPrice * pkg.classes).toLocaleString('en-IN')}</span>
                                )}
                            </div>

                            <div className="text-sm text-slate-600 font-medium">
                                {pkg.classes} {pkg.classes === 1 ? 'class' : 'classes'} • ₹{teacherPrice}/class
                            </div>

                            {pkg.discount > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                        SAVE {pkg.discount}%
                                    </span>
                                    <span className="text-xs text-green-600 font-bold">
                                        Save ₹{Math.round(pkg.savings)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {pkg.type === 'monthly' && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">
                                    ✓ Flexible scheduling<br />
                                    ✓ Best value for money<br />
                                    ✓ Consistent learning
                                </p>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {selectedPackage !== 'single' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-blue-800 font-bold">
                        🎉 Great choice! Package bookings get priority support and flexible rescheduling.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PackageSelector;
