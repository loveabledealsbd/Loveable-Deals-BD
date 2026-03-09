import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from "firebase/firestore";

// Fetch all coupons
export async function fetchAllCoupons() {
    const snapshot = await getDocs(collection(db, "coupons"));
    return snapshot.docs.map((doc) => ({ code: doc.id, ...doc.data() }));
}

// Fetch coupon by code
export async function fetchCouponByCode(code) {
    const docRef = doc(db, "coupons", code.toUpperCase());
    const { getDoc } = await import("firebase/firestore");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { code: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// Fetch public coupons
export async function fetchPublicCoupons() {
    const q = query(collection(db, "coupons"), where("isPublic", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ code: doc.id, ...doc.data() }));
}

// Add a new coupon (using code as document ID)
export async function addCoupon(couponData) {
    const code = couponData.code.toUpperCase();
    await setDoc(doc(db, "coupons", code), {
        description: couponData.description,
        discount: Number(couponData.discount),
        forNewUser: couponData.forNewUser || false,
        forMember: couponData.forMember || false,
        isPublic: couponData.isPublic || false,
        expiresAt: couponData.expiresAt,
        createdAt: new Date().toISOString(),
    });
    return code;
}

// Delete a coupon
export async function deleteCouponByCode(code) {
    await deleteDoc(doc(db, "coupons", code));
}
