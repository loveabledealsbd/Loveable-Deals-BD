import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// Fetch all products
export async function fetchAllProducts() {
    const snapshot = await getDocs(collection(db, "products"));
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch all ratings to attach for average display
    const ratingsSnapshot = await getDocs(collection(db, "ratings"));
    const ratings = ratingsSnapshot.docs.map(doc => doc.data());

    return docs.map(product => {
        const productRatings = ratings.filter(r => r.productId === product.id);
        return {
            ...product,
            rating: productRatings
        };
    }).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Fetch product by ID
export async function fetchProductById(productId) {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// Fetch products by store ID
export async function fetchProductsByStoreId(storeId) {
    const q = query(
        collection(db, "products"),
        where("storeId", "==", storeId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const ratingsQ = query(
        collection(db, "ratings"),
        where("storeId", "==", storeId)
    );
    const ratingsSnapshot = await getDocs(ratingsQ);
    const ratings = ratingsSnapshot.docs.map(doc => doc.data());

    return docs.map(product => {
        const productRatings = ratings.filter(r => r.productId === product.id);
        return {
            ...product,
            rating: productRatings
        };
    }).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// Add a new product
export async function addProduct(productData) {
    const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        inStock: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update an existing product
export async function updateProduct(productId, productData) {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp(),
    });
}

// Toggle product stock status
export async function toggleProductStock(productId, currentStatus) {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, {
        inStock: !currentStatus,
        updatedAt: serverTimestamp(),
    });
}
