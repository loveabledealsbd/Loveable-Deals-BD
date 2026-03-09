'use client'
import Link from "next/link"
import Image from "next/image"
import { assets } from "@/assets/assets"

const AdminNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative flex items-center">
                <Image src={assets.logo} alt="Loveable Deals BD logo" width={150} height={40} className="w-28 sm:w-36 object-contain" />
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, Admin</p>
            </div>
        </div>
    )
}

export default AdminNavbar