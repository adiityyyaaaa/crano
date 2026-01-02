/**
 * Pricing Service for Package Bookings
 * Handles discount calculations and pricing logic
 */

interface PricingResult {
    basePrice: number;
    totalClasses: number;
    totalPrice: number;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
}

export class PricingService {
    // Discount rates for different package types
    private static readonly DISCOUNTS = {
        single: 0,
        weekly: 10,  // 10% off
        monthly: 20  // 20% off
    };

    /**
     * Calculate package pricing with discounts
     */
    static calculatePackagePrice(
        packageType: 'single' | 'weekly' | 'monthly',
        pricePerClass: number,
        numberOfClasses: number
    ): PricingResult {
        const discountPercent = this.DISCOUNTS[packageType];
        const totalPrice = pricePerClass * numberOfClasses;
        const discountAmount = (totalPrice * discountPercent) / 100;
        const finalPrice = totalPrice - discountAmount;

        return {
            basePrice: pricePerClass,
            totalClasses: numberOfClasses,
            totalPrice,
            discountPercent,
            discountAmount,
            finalPrice
        };
    }

    /**
     * Get recommended number of classes for package type
     */
    static getRecommendedClasses(packageType: 'single' | 'weekly' | 'monthly'): number {
        switch (packageType) {
            case 'single':
                return 1;
            case 'weekly':
                return 5; // Mon-Fri
            case 'monthly':
                return 20; // ~5 days/week × 4 weeks
            default:
                return 1;
        }
    }

    /**
     * Calculate package duration in days
     */
    static getPackageDuration(packageType: 'single' | 'weekly' | 'monthly'): number {
        switch (packageType) {
            case 'single':
                return 1;
            case 'weekly':
                return 7;
            case 'monthly':
                return 30;
            default:
                return 1;
        }
    }

    /**
     * Format price for display
     */
    static formatPrice(amount: number): string {
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    /**
     * Calculate savings amount
     */
    static calculateSavings(packageType: 'single' | 'weekly' | 'monthly', pricePerClass: number, numberOfClasses: number): number {
        const pricing = this.calculatePackagePrice(packageType, pricePerClass, numberOfClasses);
        return pricing.discountAmount;
    }
}

export default PricingService;
