'use client'
import { Search, ShoppingCart, LogOut, UserIcon, PackageIcon, StoreIcon, LayoutDashboardIcon, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { assets } from "@/assets/assets";

const Navbar = () => {

    const router = useRouter();
    const { user, loginWithGoogle, logout } = useAuth();

    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative flex items-center">
                        <Image src={assets.logo} alt="Loveable Deals BD logo" width={150} height={40} className="w-28 sm:w-36 object-contain" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/about">About</Link>
                        <Link href="/contact">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name} width={32} height={32} className="size-8 rounded-full object-cover ring-2 ring-green-400" />
                                    ) : (
                                        <div className="size-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                        <Link href="/orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                            <PackageIcon size={16} /> My Orders
                                        </Link>
                                        {user.email === 'loveabledealsbd@gmail.com' && (
                                            <>
                                                <Link href="/create-store" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                                    <StoreIcon size={16} /> Seller Dashboard
                                                </Link>
                                                <Link href="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                                    <LayoutDashboardIcon size={16} /> Admin Dashboard
                                                </Link>
                                            </>
                                        )}
                                        <button onClick={() => { logout(); setShowDropdown(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={loginWithGoogle} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                Login
                            </button>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/cart" className="relative flex items-center text-slate-600">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-1 -right-2 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                        </Link>
                        {user ? (
                            <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} width={32} height={32} className="size-8 rounded-full object-cover ring-2 ring-green-400" />
                                ) : (
                                    <div className="size-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </button>
                        ) : (
                            <button onClick={loginWithGoogle} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && user && (
                <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
                    <div className="px-6 py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <form onSubmit={handleSearch} className="px-6 py-3 border-b border-slate-100 flex items-center bg-slate-50 gap-2">
                        <Search size={16} className="text-slate-500" />
                        <input className="w-full bg-transparent outline-none text-sm placeholder-slate-500 text-slate-700" type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} required />
                    </form>
                    <Link href="/" onClick={() => setShowMobileMenu(false)} className="block px-6 py-3 text-slate-600 hover:bg-slate-50">Home</Link>
                    <Link href="/shop" onClick={() => setShowMobileMenu(false)} className="block px-6 py-3 text-slate-600 hover:bg-slate-50">Shop</Link>
                    <Link href="/orders" onClick={() => setShowMobileMenu(false)} className="block px-6 py-3 text-slate-600 hover:bg-slate-50">My Orders</Link>
                    
                    {user.email === 'loveabledealsbd@gmail.com' && (
                        <>
                            <Link href="/create-store" onClick={() => setShowMobileMenu(false)} className="block px-6 py-3 text-slate-600 hover:bg-slate-50">Seller Dashboard</Link>
                            <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="block px-6 py-3 text-slate-600 hover:bg-slate-50">Admin Dashboard</Link>
                        </>
                    )}

                    <button onClick={() => { logout(); setShowMobileMenu(false); }} className="block w-full text-left px-6 py-3 text-red-500 hover:bg-red-50">Logout</button>
                </div>
            )}

            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar