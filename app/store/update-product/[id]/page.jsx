'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState, useEffect, use } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { fetchStoreByUserId } from "@/lib/firestore/stores"
import { fetchProductById, updateProduct } from "@/lib/firestore/products"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Convert existing base64 image data to a File object for the input field to display
function dataURLtoFile(dataurl, filename) {
    if(!dataurl) return null;
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

export default function StoreUpdateProduct({ params }) {
    // Ungroup params promise
    const unwrappedParams = use(params);
    const productId = unwrappedParams.id;

    const router = useRouter()
    const { user } = useAuth()

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    // Keep both raw base64 arrays from db and File obj selection logic handled
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [existingBase64Images, setExistingBase64Images] = useState([])
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const fetchProductData = async () => {
            if (!user?.uid) return;

            try {
                const product = await fetchProductById(productId);
                if (!product) {
                    toast.error("Product not found");
                    router.push('/store/manage-product');
                    return;
                }

                // Verify store ownership
                const store = await fetchStoreByUserId(user.uid);
                if (store?.id !== product.storeId) {
                    toast.error("Unauthorized to edit this product");
                    router.push('/store/manage-product');
                    return;
                }

                setProductInfo({
                    name: product.name || "",
                    description: product.description || "",
                    mrp: product.mrp || 0,
                    price: product.price || 0,
                    category: product.category || "",
                });

                if (product.images && product.images.length > 0) {
                    let formattedImages = { 1: null, 2: null, 3: null, 4: null };
                    product.images.forEach((img, i) => {
                        if (i < 4) {
                            try {
                                formattedImages[i + 1] = dataURLtoFile(img, `image${i+1}.png`);
                            } catch (e) {
                                console.error("Error formatting base64 to file", e);
                            }
                        }
                    });
                    setImages(formattedImages);
                    setExistingBase64Images(product.images);
                }

            } catch (error) {
                console.error("Failed to load product", error);
                toast.error("Failed to load product data");
            }
            setLoading(false);
        }

        fetchProductData();
    }, [user, productId, router]);

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user?.uid) {
            toast.error("Please login to update a product")
            return
        }

        setUpdating(true)

        try {
            const store = await fetchStoreByUserId(user.uid)
            if (!store) {
                toast.error("Store not found")
                setUpdating(false)
                return
            }

            // Convert ONLY NEW image files to base64 strings
            // Re-read files to see if user changed them OR if they are the original files we converted backwards above
            let finalImageBase64List = [];
            let imageKeys = Object.keys(images);
            
            for(let i=0; i < imageKeys.length; i++) {
                const file = images[imageKeys[i]];
                if (file) {
                    // Check if it's potentially an already existing unmodified base64 image converted to file earlier
                    // For safety, we re-parse any present file into base64 to guarantee format matches
                    const b64 = await fileToBase64(file);
                    finalImageBase64List.push(b64);
                }
            }

            if (finalImageBase64List.length === 0) {
                toast.error("Please ensure at least one image exists.")
                setUpdating(false)
                return
            }

            // Calculate total size
            const totalSize = finalImageBase64List.reduce((acc, curr) => acc + (curr.length * 0.75), 0);
            if (totalSize > 900 * 1024) {
                toast.error("Images are too large. Please use smaller images (total < 900KB)")
                setUpdating(false)
                return
            }

            const productData = {
                name: productInfo.name,
                description: productInfo.description,
                mrp: Number(productInfo.mrp),
                price: Number(productInfo.price),
                category: productInfo.category,
                images: finalImageBase64List,
            }

            await updateProduct(productId, productData)
            toast.success("Product updated successfully!")
            router.push('/store/manage-product');
            
        } catch (error) {
            console.error("Error updating product:", error)
            toast.error("Failed to update product")
        }
        setUpdating(false)
    }

    if (loading) return <Loading />

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Update <span className="text-slate-800 font-medium">Product</span></h1>
            <p className="mt-7">Product Images <span className="text-xs text-slate-400">(keep each image under 200KB for best results)</span></p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image
                            width={300}
                            height={300}
                            className='h-15 w-auto border border-slate-200 rounded cursor-pointer object-cover'
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

            <div className="flex gap-4 mt-7">
                <button
                    type="submit"
                    disabled={updating}
                    className="bg-slate-800 text-white px-6 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50"
                >
                    {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/store/manage-product')}
                    className="bg-slate-200 text-slate-700 px-6 py-2 hover:bg-slate-300 rounded transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
