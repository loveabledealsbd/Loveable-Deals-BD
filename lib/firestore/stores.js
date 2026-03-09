import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// Fetch store by user ID
export async function fetchStoreByUserId(userId) {
    const q = query(collection(db, "stores"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// Fetch store by username
export async function fetchStoreByUsername(username) {
    const q = query(collection(db, "stores"), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// Fetch store by ID
export async function fetchStoreById(storeId) {
    const docRef = doc(db, "stores", storeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// Create a new store
export async function createStore(storeData) {
    const docRef = doc(collection(db, "stores"));
    await setDoc(docRef, {
        ...storeData,
        status: "pending",
        isActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Fetch pending stores (for admin approval)
export async function fetchPendingStores() {
    const q = query(collection(db, "stores"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Fetch approved stores
export async function fetchApprovedStores() {
    const q = query(collection(db, "stores"), where("status", "==", "approved"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Fetch all stores (admin)
export async function fetchAllStores() {
    const q = query(collection(db, "stores"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Approve or reject a store
export async function updateStoreStatus(storeId, status) {
    const docRef = doc(db, "stores", storeId);
    const update = { status, updatedAt: serverTimestamp() };
    if (status === "approved") {
        update.isActive = true;
    }
    await updateDoc(docRef, update);
}

// Toggle store active status
export async function toggleStoreActive(storeId, currentStatus) {
    const docRef = doc(db, "stores", storeId);
    await updateDoc(docRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
    });
}
