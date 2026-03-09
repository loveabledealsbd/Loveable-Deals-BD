'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth } from "@/context/AuthContext"
import { fetchStoreByUserId, createStore } from "@/lib/firestore/stores"
import { uploadFile } from "@/lib/firebaseStorage"
import { useRouter } from "next/navigation"

export default function CreateStore() {

    const { user } = useAuth()
    const router = useRouter()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        if (!user?.uid) {
            setLoading(false)
            return
        }

        if (user.email !== 'loveabledealsbd@gmail.com') {
            setAlreadySubmitted(true)
            setStatus("unauthorized")
            setMessage("You are not authorized to create a store.")
            setLoading(false)
            return
        }

        try {
            const store = await fetchStoreByUserId(user.uid)
            if (store) {
                setAlreadySubmitted(true)
                setStatus(store.status)
                if (store.status === "pending") {
                    // Auto-approve the default store if it's pending mapping to the special email
                    const { updateStoreStatus } = await import("@/lib/firestore/stores")
                    await updateStoreStatus(store.id, "approved")
                    setMessage("Your store has been approved! Redirecting to your dashboard...")
                    setTimeout(() => router.push('/store'), 2000)
                } else if (store.status === "approved") {
                    setMessage("Your store is active! Redirecting to your dashboard...")
                    setTimeout(() => router.push('/store'), 2000)
                } else if (store.status === "rejected") {
                    setMessage("Unfortunately, your store application was rejected. Please contact support for more information.")
                }
            } else {
                // Auto create store for the authorized email
                const storeData = {
                    userId: user.uid,
                    name: "Loveable Deals",
                    username: "loveable-deals",
                    description: "Official store for loveable deals",
                    email: user.email,
                    contact: "",
                    address: "",
                    logo: "",
                }
                
                const newStoreId = await createStore(storeData)
                // Instantly approve it
                const { updateStoreStatus } = await import("@/lib/firestore/stores")
                await updateStoreStatus(newStoreId, "approved")
                
                setAlreadySubmitted(true)
                setStatus("approved")
                setMessage("Your store has been created and approved! Redirecting to your dashboard...")
                setTimeout(() => router.push('/store'), 2000)
            }
        } catch (error) {
            console.error("Error checking seller status:", error)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchSellerStatus()
    }, [user])

    return !loading ? (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
        </div>
    ) : (<Loading />)
}