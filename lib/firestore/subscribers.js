import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

// Add a new subscriber
export async function addSubscriber(email) {
    // Check if simple string exists first
    const q = query(collection(db, "subscribers"), where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        throw new Error("Already subscribed!");
    }

    const docRef = await addDoc(collection(db, "subscribers"), {
        email,
        createdAt: serverTimestamp(),
    });
    
    return docRef.id;
}
