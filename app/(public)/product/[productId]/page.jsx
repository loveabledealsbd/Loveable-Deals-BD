'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchProductById } from "@/lib/firestore/products";
import { fetchRatingsByProductId } from "@/lib/firestore/ratings";
import { fetchStoreById } from "@/lib/firestore/stores";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            // Try Redux first, fallback to Firestore
            let prod = products.find((p) => p.id === productId);
            if (!prod) {
                prod = await fetchProductById(productId);
            }

            if (prod) {
                // Fetch ratings
                const ratings = await fetchRatingsByProductId(productId);
                prod = { ...prod, rating: ratings };

                // Fetch store info
                if (prod.storeId) {
                    const store = await fetchStoreById(prod.storeId);
                    prod = { ...prod, store: store || { name: 'Store', username: '', logo: '' } };
                } else {
                    prod = { ...prod, store: { name: 'Store', username: '', logo: '' } };
                }

                setProduct(prod);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchProduct();
        scrollTo(0, 0);
    }, [productId, products]);

    if (loading && !product) return <Loading />;

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}