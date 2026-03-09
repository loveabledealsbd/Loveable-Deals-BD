'use client'
import { useAuth } from "@/context/AuthContext"
import { placeOrder } from "@/lib/firestore/orders"
import { clearCart } from "@/lib/features/cart/cartSlice"
import { updateUserCart } from "@/lib/firestore/users"
import { CreditCardIcon, LockIcon, CheckCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"

export default function PaymentPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useAuth()

    const [orderData, setOrderData] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [paymentDone, setPaymentDone] = useState(false)
    const [cardInfo, setCardInfo] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
    })

    useEffect(() => {
        const pending = sessionStorage.getItem('pendingOrder')
        if (pending) {
            setOrderData(JSON.parse(pending))
        } else {
            router.push('/cart')
        }
    }, [router])

    const totalPrice = orderData?.totalPrice || 0
    const coupon = orderData?.coupon || null
    const finalTotal = coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toFixed(2)

    const handlePayment = async (e) => {
        e.preventDefault()
        if (!user?.uid) {
            toast.error('Please login to complete payment')
            return
        }

        setProcessing(true)

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Group items by store and place orders
        const items = orderData.items
        const storeGroups = {}
        items.forEach(item => {
            const storeId = item.storeId || 'default'
            if (!storeGroups[storeId]) storeGroups[storeId] = []
            storeGroups[storeId].push(item)
        })

        for (const [storeId, storeItems] of Object.entries(storeGroups)) {
            const orderTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const discountedTotal = coupon ? orderTotal - (coupon.discount / 100 * orderTotal) : orderTotal

            const order = {
                total: Number(discountedTotal.toFixed(2)),
                userId: user.uid,
                storeId,
                addressId: orderData.selectedAddress.id,
                isPaid: true,
                paymentMethod: 'STRIPE',
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
                user: { name: user.name, email: user.email },
                address: orderData.selectedAddress,
            }

            await placeOrder(order)
        }

        // Clear cart
        dispatch(clearCart())
        await updateUserCart(user.uid, {})
        sessionStorage.removeItem('pendingOrder')

        setProcessing(false)
        setPaymentDone(true)

        setTimeout(() => {
            router.push('/orders')
        }, 3000)
    }

    if (paymentDone) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <CheckCircleIcon size={64} className="text-green-500" />
                <h1 className="text-3xl font-semibold text-slate-700">Payment Successful!</h1>
                <p className="text-slate-500">Your order has been placed. Redirecting to orders...</p>
            </div>
        )
    }

    if (!orderData) return null

    return (
        <div className="min-h-[70vh] mx-6 my-16">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-8">
                    <LockIcon size={20} className="text-green-600" />
                    <h1 className="text-2xl font-semibold text-slate-800">Secure Payment</h1>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm text-slate-600">
                    <p className="font-medium text-slate-700 mb-2">Order Summary</p>
                    {orderData.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1">
                            <span>{item.name} × {item.quantity}</span>
                            <span>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr className="my-2 border-slate-200" />
                    {coupon && (
                        <div className="flex justify-between py-1 text-green-600">
                            <span>Coupon ({coupon.code})</span>
                            <span>-{currency}{(coupon.discount / 100 * totalPrice).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-slate-800 pt-1">
                        <span>Total</span>
                        <span>{currency}{finalTotal}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Card Number</label>
                        <div className="relative">
                            <CreditCardIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardInfo.number}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '').substring(0, 16)
                                    val = val.replace(/(.{4})/g, '$1 ').trim()
                                    setCardInfo({ ...cardInfo, number: val })
                                }}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Cardholder Name</label>
                        <input
                            type="text"
                            placeholder="Name on Card"
                            value={cardInfo.name}
                            onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-slate-400"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-slate-500 mb-1 block">Expiry Date</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={cardInfo.expiry}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '').substring(0, 4)
                                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2)
                                    setCardInfo({ ...cardInfo, expiry: val })
                                }}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-slate-400"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-slate-500 mb-1 block">CVV</label>
                            <input
                                type="password"
                                placeholder="•••"
                                maxLength={4}
                                value={cardInfo.cvv}
                                onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '') })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {processing ? 'Processing Payment...' : `Pay ${currency}${finalTotal}`}
                    </button>

                    <p className="text-xs text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                        <LockIcon size={12} /> Your payment info is secure and encrypted
                    </p>
                </form>
            </div>
        </div>
    )
}
