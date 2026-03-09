'use client'
import Loading from "@/components/Loading"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchAllCoupons, addCoupon, deleteCouponByCode } from "@/lib/firestore/coupons"
import { toast } from "react-hot-toast"

export default function AdminCoupons() {
    const [loading, setLoading] = useState(true)
    const [coupons, setCoupons] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [couponInfo, setCouponInfo] = useState({
        code: "",
        description: "",
        discount: 0,
        expiresAt: "",
        forNewUser: false,
        forMember: false,
        isPublic: true,
    })

    const fetchCoupons = async () => {
        try {
            const data = await fetchAllCoupons()
            setCoupons(data)
        } catch (error) {
            console.error("Error fetching coupons:", error)
        }
        setLoading(false)
    }

    const onChangeHandler = (e) => {
        const { name, value, type, checked } = e.target
        setCouponInfo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        if (!couponInfo.code || couponInfo.discount <= 0 || !couponInfo.expiresAt) return

        setIsSubmitting(true)
        try {
               await addCoupon({...couponInfo})
               // optimistically add
               setCoupons(prev => [{...couponInfo, code: couponInfo.code.toUpperCase()}, ...prev])
               toast.success("Coupon added successfully")
               setCouponInfo({
                   code: "",
                   description: "",
                   discount: 0,
                   expiresAt: "",
                   forNewUser: false,
                   forMember: false,
                   isPublic: true,
               })
        } catch (error) {
             console.error("Error adding coupon:", error)
             toast.error("Failed to add coupon")
        }
        setIsSubmitting(false)
    }

    const deleteCoupon = async (code) => {
         try {
             await deleteCouponByCode(code)
             setCoupons(prev => prev.filter(c => c.code !== code))
             toast.success("Coupon deleted")
         } catch (error) {
            console.error("Error deleting coupon:", error)
            toast.error("Failed to delete coupon")
         }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Coupons</span></h1>

            <div className="flex max-xl:flex-col-reverse gap-6 mt-8">

                {/* Coupons List */}
                <div className="flex-1 overflow-x-auto ring ring-slate-200 rounded max-w-4xl max-xl:h-[450px]">
                    <div className="w-full min-w-[600px] text-left text-sm">
                        <div className="bg-slate-50 text-gray-700 uppercase tracking-wider grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] border-b border-gray-200">
                            <div className="px-4 py-3">Promo Code</div>
                            <div className="px-4 py-3">Description</div>
                            <div className="px-4 py-3">Discount</div>
                            <div className="px-4 py-3">Type</div>
                            <div className="px-4 py-3">Expiry Date</div>
                            <div className="px-4 py-3 text-center">Action</div>
                        </div>
                        <div className="text-slate-700">
                            {coupons.map((coupon) => (
                                <div key={coupon.code} className="border-b border-gray-200 hover:bg-gray-50 grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] items-center">
                                    <div className="px-4 py-3 font-semibold text-green-700">{coupon.code}</div>
                                    <div className="px-4 py-3 text-slate-500 truncate">{coupon.description}</div>
                                    <div className="px-4 py-3">{coupon.discount}% off</div>
                                    <div className="px-4 py-3 text-xs leading-4 text-slate-500">
                                        {coupon.isPublic && <span className="">Public</span>}
                                        {coupon.forNewUser && <span className="">New User</span>}
                                        {coupon.forMember && <span className="">Member</span>}
                                    </div>
                                    <div className="px-4 py-3 text-slate-400">{new Date(coupon.expiresAt).toLocaleDateString()}</div>
                                    <div className="px-4 py-3 text-center flex justify-center">
                                        <button onClick={() => deleteCoupon(coupon.code)} className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                            <Trash2Icon size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Coupon Form */}
                <form onSubmit={handleAddCoupon} className="flex-1 w-full max-w-sm h-fit border border-slate-200 p-6 rounded-md">
                    <p className="font-semibold text-slate-800">Add New Coupon</p>

                    <label className="flex flex-col gap-2 my-4">
                        Coupon Code
                        <input name="code" value={couponInfo.code} onChange={onChangeHandler} type="text" placeholder="e.g. SUMMER50" className="p-2 outline-none border border-slate-200 rounded text-slate-600" required />
                    </label>

                    <label className="flex flex-col gap-2 my-4">
                        Description
                        <input name="description" value={couponInfo.description} onChange={onChangeHandler} type="text" placeholder="e.g. 50% discount on summer sale" className="p-2 outline-none border border-slate-200 rounded text-slate-600" required />
                    </label>

                    <div className="flex gap-4 mb-4">
                        <label className="flex flex-col gap-2 w-full">
                            Discount (%)
                            <input name="discount" value={couponInfo.discount} onChange={onChangeHandler} type="number" placeholder="50" className="p-2 outline-none border border-slate-200 rounded text-slate-600 w-full" required />
                        </label>
                        <label className="flex flex-col gap-2 w-full">
                            Expiry Date
                            <input name="expiresAt" value={couponInfo.expiresAt} onChange={onChangeHandler} type="date" className="p-2 outline-none border border-slate-200 rounded text-slate-600 w-full" required />
                        </label>
                    </div>

                    <div className="mb-4 bg-slate-50 p-4 border border-slate-100 rounded text-sm flex flex-col gap-2">
                        <p className="-mt-1 font-semibold text-slate-600 mb-1">Coupon Type</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isPublic" checked={couponInfo.isPublic} onChange={onChangeHandler} />
                            Available for all
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input type="checkbox" name="forNewUser" checked={couponInfo.forNewUser} onChange={onChangeHandler} />
                            Only for new users
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input type="checkbox" name="forMember" checked={couponInfo.forMember} onChange={onChangeHandler} />
                            Only for members
                        </label>
                    </div>

                    <button disabled={isSubmitting} className="bg-slate-800 text-white w-full py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all"> {isSubmitting ? 'Adding...' : 'Add Coupon'}</button>
                </form>

            </div>

        </div>
    )
}