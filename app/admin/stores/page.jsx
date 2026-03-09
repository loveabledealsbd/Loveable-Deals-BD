'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import { fetchApprovedStores, toggleStoreActive } from "@/lib/firestore/stores"
import Image from "next/image"
import { toast } from "react-hot-toast"

export default function AdminStores() {
    const [loading, setLoading] = useState(true)
    const [stores, setStores] = useState([])

    const fetchStores = async () => {
        try {
            const data = await fetchApprovedStores()
            setStores(data)
        } catch (error) {
            console.error("Error fetching approved stores:", error)
        }
        setLoading(false)
    }

    const toggleIsActive = async (storeId, currentStatus) => {
        try {
            await toggleStoreActive(storeId, currentStatus)
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, isActive: !currentStatus } : s))
            toast.success(`Store is now ${!currentStatus ? 'Active' : 'Inactive'}`)
        } catch (error) {
             console.error("Error updating store active state:", error)
             toast.error("Failed to update store status")
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Live Stores</span></h1>
            {stores.length === 0 ? (
                 <p className="text-slate-400 mt-4">No approved stores yet.</p>
            ):(
            <table className="w-full max-w-4xl text-left mt-8 ring ring-slate-200 rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Store Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {stores.map((store) => (
                        <tr key={store.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    {store.logo && <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={store.logo} alt="" />}
                                    <p className="font-medium text-slate-800">{store.name}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-sm text-slate-500 hidden md:table-cell truncate">{store.description}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{store.email}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toggleIsActive(store.id, store.isActive)} checked={store.isActive} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}

        </div>
    )
}