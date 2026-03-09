'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { assets } from "@/assets/assets"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"
import { addRatingToFirestore } from "@/lib/firestore/ratings"

const ProductDescription = ({ product }) => {

    const { user } = useAuth()
    const [selectedTab, setSelectedTab] = useState('Description')
    const [reviewInput, setReviewInput] = useState('')
    const [ratingInput, setRatingInput] = useState(5)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localRatings, setLocalRatings] = useState(product?.rating || [])

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to submit a review');
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewData = {
                productId: product.id,
                userId: user.uid,
                storeId: product.storeId || '',
                rating: ratingInput,
                review: reviewInput,
                user: {
                    name: user.name || 'Anonymous',
                    image: user.image || assets.upload_area
                }
            };
            
            const newDocId = await addRatingToFirestore(reviewData);
            
            // Add to local state so it appears immediately without refresh
            setLocalRatings([{ id: newDocId, ...reviewData, createdAt: new Date() }, ...localRatings]);
            setReviewInput('');
            setRatingInput(5);
            toast.success('Review submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit review');
            console.error(error);
        }
        setIsSubmitting(false);
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {/* Add Review Form */}
                    {user ? (
                        <form onSubmit={handleReviewSubmit} className="mb-10 bg-slate-50 p-6 rounded-lg border border-slate-100">
                            <h3 className="text-lg font-medium text-slate-800 mb-4">Write a Review</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-slate-600">Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                        key={star}
                                        size={20}
                                        className="cursor-pointer transition text-transparent"
                                        fill={ratingInput >= star ? "#00C950" : "#D1D5DB"}
                                        onClick={() => setRatingInput(star)}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={reviewInput}
                                onChange={(e) => setReviewInput(e.target.value)}
                                placeholder="Share your thoughts about this product..."
                                className="w-full p-4 border border-slate-200 rounded-md outline-none mb-4 resize-none h-24"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-900 transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-10 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                            Please login to write a review.
                        </div>
                    )}

                    {localRatings.length > 0 ? localRatings.map((item,index) => (
                        <div key={index} className="flex gap-5 mb-10">
                            <div className="shrink-0">
                                <Image src={item?.user?.image || assets.upload_area} alt="" className="size-10 rounded-full object-cover" width={40} height={40} />
                            </div>
                            <div>
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, index) => (
                                        <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="font-medium text-slate-800">{item?.user?.name || 'Anonymous'}</p>
                                <p className="mt-3 font-light text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toDateString() : ''}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500">No reviews yet for this product.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductDescription