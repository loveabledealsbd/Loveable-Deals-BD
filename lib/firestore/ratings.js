import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// Fetch ratings for a product
export async function fetchRatingsByProductId(productId) {
    const q = query(
        collection(db, "ratings"),
        where("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Fetch ratings for a store's products
export async function fetchRatingsByStoreId(storeId) {
    const q = query(
        collection(db, "ratings"),
        where("storeId", "==", storeId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Add a new rating
export async function addRatingToFirestore(ratingData) {
    const docRef = await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Check if user has already rated a product for an order
export async function checkExistingRating(userId, productId, orderId) {
    const q = query(
        collection(db, "ratings"),
        where("userId", "==", userId),
        where("productId", "==", productId),
        where("orderId", "==", orderId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}
