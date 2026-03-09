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

// Fetch all addresses for a user
export async function fetchAddressesByUserId(userId) {
    const q = query(
        collection(db, "addresses"),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort client-side to avoid needing a Firestore composite index
    return docs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
    });
}

// Add a new address
export async function addAddressToFirestore(addressData) {
    const docRef = await addDoc(collection(db, "addresses"), {
        ...addressData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}
