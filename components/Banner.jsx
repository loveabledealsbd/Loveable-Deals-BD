'use client'
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchPublicCoupons } from '@/lib/firestore/coupons';

export default function Banner() {

    const [isOpen, setIsOpen] = useState(false);
    const [couponCode, setCouponCode] = useState(null);
    const [description, setDescription] = useState("Get Exclusive Offers on Your First Order!");

    useEffect(() => {
        const loadBanner = async () => {
            // Check if already claimed
            const claimed = localStorage.getItem('claimedCoupon');
            if (claimed) {
                return; // Do not show banner
            }

            try {
                const publicCoupons = await fetchPublicCoupons();
                if (publicCoupons && publicCoupons.length > 0) {
                    // Check for valid unexpired coupon
                    const now = new Date();
                    const validCoupon = publicCoupons.find(c => new Date(c.expiresAt) > now);
                    
                    if (validCoupon) {
                        setCouponCode(validCoupon.code);
                        if (validCoupon.description) {
                            // if there is a discount value, inject it dynamically "Get 20% OFF" -> "Get X% OFF"
                            if (validCoupon.discount) {
                                setDescription(`Get ${validCoupon.discount}% OFF on Your First Order!`);
                            } else {
                                setDescription(validCoupon.description);
                            }
                        }
                        setIsOpen(true);
                    }
                }
            } catch (error) {
                console.error("Failed to load public coupon", error);
            }
        };
        loadBanner();
    }, []);

    const handleClaim = () => {
        if (!couponCode) return;
        
        localStorage.setItem('claimedCoupon', couponCode);
        setIsOpen(false);
        toast.success(`Coupon '${couponCode}' copied to clipboard!`);
        navigator.clipboard.writeText(couponCode);
    };

    return isOpen && (
        <div className="w-full px-6 py-1 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className='flex items-center justify-between max-w-7xl  mx-auto'>
                <p>{description}</p>
                <div className="flex items-center space-x-6">
                    <button onClick={handleClaim} type="button" className="font-normal text-gray-800 bg-white px-7 py-2 rounded-full max-sm:hidden">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-800 py-2 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};