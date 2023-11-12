import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Gets a download link for a user's profile picture, if one exists
 * @param uid UID string for a Firebase Authentication user
 * @returns Download link if one exists, otherwise empty string
 */
export async function getProfilePic(uid: string) {
    if (uid == "") {
        console.warn("getProfilePic() called with empty uid");
        return "";
    }

    const pic_url = `profile_pics/${uid}`
    const pic_ref = ref(storage, pic_url);

    try {
        const dl_url = await getDownloadURL(pic_ref);
        return dl_url;
    }
    catch {
        return "";
    }
}
