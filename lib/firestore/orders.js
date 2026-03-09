import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// Fetch all orders for a user
export async function fetchOrdersByUserId(userId) {
    const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Fetch all orders for a store
export async function fetchOrdersByStoreId(storeId) {
    const q = query(
        collection(db, "orders"),
        where("storeId", "==", storeId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Fetch all orders (admin)
export async function fetchAllOrders() {
    const snapshot = await getDocs(collection(db, "orders"));
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Place a new order
export async function placeOrder(orderData) {
    const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        status: "ORDER_PLACED",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update order status
export async function updateOrderStatus(orderId, status) {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
    });
}
