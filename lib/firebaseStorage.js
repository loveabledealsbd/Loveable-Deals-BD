import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload a file to Firebase Storage and return the download URL
 * @param {File} file - The file to upload
 * @param {string} path - Storage path, e.g. "products/image1.jpg"
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

/**
 * Upload multiple files and return their download URLs
 * @param {File[]} files - Array of files
 * @param {string} folder - Folder path in storage
 * @returns {Promise<string[]>} Array of download URLs
 */
export async function uploadMultipleFiles(files, folder) {
    const urls = [];
    for (const file of files) {
        if (file) {
            const path = `${folder}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            urls.push(url);
        }
    }
    return urls;
}
