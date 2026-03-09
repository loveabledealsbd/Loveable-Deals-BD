import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { placeOrder, fetchOrdersByUserId } from '@/lib/firestore/orders';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { updateUserCart } from '@/lib/firestore/users';
import { fetchCouponByCode } from '@/lib/firestore/coupons';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useAuth();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [savedCoupon, setSavedCoupon] = useState(null);

    useEffect(() => {
        const loadSavedCoupon = async () => {
            if (!user?.uid) return;
            const claimed = localStorage.getItem('claimedCoupon');
            if (claimed) {
                try {
                    // Check if the user already used this coupon in any of their past orders
                    const userOrders = await fetchOrdersByUserId(user.uid);
                    const alreadyUsed = userOrders.some(o => o.isCouponUsed && o.coupon?.code === claimed);
                    
                    if (!alreadyUsed) {
                        const couponData = await fetchCouponByCode(claimed);
                        if (couponData) {
                            const now = new Date();
                            const expiresAt = new Date(couponData.expiresAt);
                            // Verify the coupon is not expired
                            if (expiresAt >= now) {
                                setSavedCoupon(couponData);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error loading saved coupon", error);
                }
            }
        };
        loadSavedCoupon();
    }, [user]);

    const handleCouponCode = async (event) => {
        event.preventDefault();

        if (!couponCodeInput.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        const couponData = await fetchCouponByCode(couponCodeInput.trim());

        if (!couponData) {
            toast.error('Invalid coupon code');
            return;
        }

        // Check expiry
        const now = new Date();
        const expiresAt = new Date(couponData.expiresAt);
        if (expiresAt < now) {
            toast.error('This coupon has expired');
            return;
        }

        setCoupon(couponData);
        toast.success(`Coupon applied! ${couponData.discount}% off`);
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user?.uid) {
            toast.error('Please login to place an order');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // For COD, place order directly
        await createOrder(false);
    }

    const createOrder = async (isPaid) => {
        // Group items by store
        const storeGroups = {};
        items.forEach(item => {
            const storeId = item.storeId || 'default';
            if (!storeGroups[storeId]) storeGroups[storeId] = [];
            storeGroups[storeId].push(item);
        });

        // Create one order per store
        for (const [storeId, storeItems] of Object.entries(storeGroups)) {
            const orderTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountedTotal = coupon ? orderTotal - (coupon.discount / 100 * orderTotal) : orderTotal;

            const orderData = {
                total: Number(discountedTotal.toFixed(2)),
                userId: user.uid,
                storeId: storeId,
                addressId: selectedAddress.id,
                isPaid,
                paymentMethod,
                isCouponUsed: !!coupon,
                coupon: coupon ? { code: coupon.code, discount: coupon.discount } : {},
                orderItems: storeItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    product: {
                        id: item.id,
                        name: item.name,
                        images: item.images,
                        category: item.category,
                    }
                })),
                user: {
                    name: user.name,
                    email: user.email,
                },
                address: selectedAddress,
            };

            await placeOrder(orderData);
        }

        // Clear cart
        dispatch(clearCart());
        await updateUserCart(user.uid, {});

        toast.success('Order placed successfully!');
        router.push('/orders');
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={true} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>Cash on Delivery (COD)</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <div className='flex flex-col gap-3 mt-3'>
                            {savedCoupon && (
                                <div className='p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center'>
                                    <div>
                                        <p className='text-xs text-green-800 font-medium'>Saved Offer Available</p>
                                        <p className='text-sm text-green-700 font-bold'>{savedCoupon.code} - {savedCoupon.discount}% OFF</p>
                                    </div>
                                    <button 
                                        onClick={() => { setCoupon(savedCoupon); toast.success(`Saved coupon applied!`); }} 
                                        className='bg-green-600 text-white px-3 py-1.5 text-xs rounded hover:bg-green-700 transition'
                                    >
                                        Apply Offer
                                    </button>
                                </div>
                            )}
                            <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3'>
                                <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                                <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all flex-shrink-0'>Apply</button>
                            </form>
                        </div>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary