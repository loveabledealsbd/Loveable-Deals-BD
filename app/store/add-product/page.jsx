'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { fetchStoreByUserId } from "@/lib/firestore/stores"
import { addProduct } from "@/lib/firestore/products"

/**
 * Converts a File object to a base64 data URL string.
 * This avoids Firebase Storage entirely — images are stored as base64 in Firestore.
 * Works on localhost without any CORS configuration needed.
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export default function StoreAddProduct() {

    const { user } = useAuth()

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user?.uid) {
            toast.error("Please login to add a product")
            return
        }

        setLoading(true)

        try {
            // Get store info
            const store = await fetchStoreByUserId(user.uid)
            if (!store) {
                toast.error("Store not found. Please set up your store first.")
                setLoading(false)
                return
            }

            // Convert image files to base64 strings (no Firebase Storage needed)
            const imageFiles = Object.values(images).filter(img => img !== null)
            if (imageFiles.length === 0) {
                toast.error("Please upload at least one image")
                setLoading(false)
                return
            }

            // Check total image size (Firestore limit is 1MB per document)
            const totalSize = imageFiles.reduce((sum, f) => sum + f.size, 0)
            if (totalSize > 900 * 1024) {
                toast.error("Images are too large. Please use smaller images (total < 900KB)")
                setLoading(false)
                return
            }

            const imageBase64Strings = await Promise.all(imageFiles.map(fileToBase64))

            // Create product in Firestore with base64 images
            const productData = {
                name: productInfo.name,
                description: productInfo.description,
                mrp: Number(productInfo.mrp),
                price: Number(productInfo.price),
                category: productInfo.category,
                images: imageBase64Strings,
                storeId: store.id,
                rating: [],
            }

            await addProduct(productData)
            toast.success("Product added successfully!")

            // Reset form
            setProductInfo({ name: "", description: "", mrp: 0, price: 0, category: "" })
            setImages({ 1: null, 2: null, 3: null, 4: null })
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("Failed to add product: " + (error.message || "Unknown error"))
        }
        setLoading(false)
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images <span className="text-xs text-slate-400">(keep each image under 200KB for best results)</span></p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image
                            width={300}
                            height={300}
                            className='h-15 w-auto border border-slate-200 rounded cursor-pointer'
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                            alt=""
                        />
                        <input
                            type="file"
                            accept='image/*'
                            id={`images${key}`}
                            onChange={e => setImages({ ...images, [key]: e.target.files[0] })}
                            hidden
                        />
                    </label>
                ))}
            </div>

            <label className="flex flex-col gap-2 my-6">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label className="flex flex-col gap-2 my-6">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <div className="flex gap-5">
                <label className="flex flex-col gap-2">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
                <label className="flex flex-col gap-2">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <br />

            <button
                type="submit"
                disabled={loading}
                className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50"
            >
                {loading ? 'Adding...' : 'Add Product'}
            </button>
        </form>
    )
}