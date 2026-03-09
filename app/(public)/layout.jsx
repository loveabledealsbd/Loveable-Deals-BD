'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "@/context/AuthContext";
import { setProduct } from "@/lib/features/product/productSlice";
import { setCart } from "@/lib/features/cart/cartSlice";
import { setAddresses } from "@/lib/features/address/addressSlice";
import { fetchAllProducts } from "@/lib/firestore/products";
import { getUserCart } from "@/lib/firestore/users";
import { fetchAddressesByUserId } from "@/lib/firestore/addresses";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch();
    const { user } = useAuth();

    // Fetch products from Firestore on mount
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await fetchAllProducts();
                dispatch(setProduct(products));
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        loadProducts();
    }, [dispatch]);

    // Sync cart and addresses when user logs in
    useEffect(() => {
        const loadUserData = async () => {
            if (user?.uid) {
                try {
                    const cart = await getUserCart(user.uid);
                    dispatch(setCart(cart));

                    const addresses = await fetchAddressesByUserId(user.uid);
                    dispatch(setAddresses(addresses));
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
        };
        loadUserData();
    }, [user, dispatch]);

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
