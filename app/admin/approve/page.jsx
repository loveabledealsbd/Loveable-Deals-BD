'use client'
import Loading from "@/components/Loading"
import StoreInfo from "@/components/admin/StoreInfo"
import { useEffect, useState } from "react"
import { fetchPendingStores, updateStoreStatus } from "@/lib/firestore/stores"
import { toast } from "react-hot-toast"

export default function AdminApprove() {
    const [loading, setLoading] = useState(true)
    const [stores, setStores] = useState([])

    const fetchStores = async () => {
        try {
            const data = await fetchPendingStores()
            setStores(data)
        } catch (error) {
            console.error("Error fetching pending stores:", error)
        }
        setLoading(false)
    }

    const handleApprove = async (storeId, action) => {
        // action can be 'approved' or 'rejected'
        try {
            await updateStoreStatus(storeId, action)
            setStores(prev => prev.filter(s => s.id !== storeId))
            toast.success(`Store ${action} successfully`)
        } catch (error) {
            console.error(`Error updating store status to ${action}:`, error)
            toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'} store`)
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Approve <span className="text-slate-800 font-medium">Stores</span></h1>

            <div className="mt-8">
                {
                    stores.length > 0 ? stores.map((store, index) => (
                        <div key={index} className="flex max-xl:flex-col gap-6 items-start justify-between py-5 border-b border-slate-200">
                            <StoreInfo store={store} />
                            <div className="flex xl:flex-col justify-end gap-3 text-sm flex-1 w-full shrink-0 max-xl:pt-4 max-xl:border-t border-slate-200">
                                <button
                                    onClick={() => handleApprove(store.id, "approved")}
                                    className="bg-green-100 text-green-700 px-8 py-2 w-full xl:w-40 rounded hover:bg-green-200 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleApprove(store.id, "rejected")}
                                    className="bg-red-100 text-red-700 px-8 py-2 w-full xl:w-40 rounded hover:bg-red-200 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    )) : <p className="text-slate-400 mt-4">No pending store applications.</p>
                }
            </div>
        </div>
    )
}