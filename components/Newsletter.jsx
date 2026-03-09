'use client'
import React, { useState } from 'react'
import Title from './Title'
import toast from 'react-hot-toast'
import { addSubscriber } from '@/lib/firestore/subscribers'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email.")
            return;
        }
        
        // Simple regex check
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address.")
            return;
        }

        setIsLoading(true)
        try {
            await addSubscriber(email.toLowerCase())
            toast.success("Subscribed successfully!")
            setEmail("")
        } catch (error) {
            if (error.message.includes("Already subscribed")) {
                toast.error("You are already subscribed!")
            } else {
                toast.error("Subscription failed. Please try again.")
            }
            console.error(error)
        }
        setIsLoading(false)
    }

    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title="Join Newsletter" description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week." visibleButton={false} />
            <form onSubmit={handleSubmit} className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input 
                    className='flex-1 pl-5 outline-none bg-transparent' 
                    type="email" 
                    placeholder='Enter your email address' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition disabled:bg-green-400'
                >
                    {isLoading ? "Subscribing..." : "Get Updates"}
                </button>
            </form>
        </div>
    )
}

export default Newsletter