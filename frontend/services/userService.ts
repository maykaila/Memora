import { updateProfile, User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 1. We import 'auth' instead of 'app' (since app is not exported)
// @ts-ignore
import { auth } from "../initializeFirebase"; 

// 2. We access the app instance through 'auth.app'
const storage = getStorage(auth.app); 

// --- Upload Function ---
export const uploadProfilePicture = async (file: File, user: User): Promise<string> => {
  try {
    const fileRef = ref(storage, `profile_pictures/${user.uid}`);
    
    // Upload the raw file
    await uploadBytes(fileRef, file);
    
    // Get the public URL to view the image
    const photoURL = await getDownloadURL(fileRef);
    return photoURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// --- Update Profile Function ---
export const updateUserProfile = async (user: User, displayName: string, photoURL?: string) => {
  try {
    await updateProfile(user, {
      displayName: displayName,
      photoURL: photoURL || user.photoURL,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};