import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Get user data from Firestore
export async function fetchUserById(userId) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// Update user cart in Firestore
export async function updateUserCart(userId, cart) {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { cart });
}

// Get user cart from Firestore
export async function getUserCart(userId) {
    const user = await fetchUserById(userId);
    return user?.cart || {};
}
