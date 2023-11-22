import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
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

  const pic_url = `profile_pics/${uid}`;
  const pic_ref = ref(storage, pic_url);

  try {
    const dl_url = await getDownloadURL(pic_ref);
    return dl_url;
  } catch {
    return "";
  }
}

/**
 * Uploads files attached to a review to Firebase Storage
 * @param reviewId id of review (for folder path name)
 * @param files list of File objects to upload
 */
export async function uploadFiles(reviewId: string, files: File[]) {
  files.forEach(async (f) => {
    console.log(f);

    // create url and ref
    const file_url = `reviews/${reviewId}/${f.name}`;
    const file_ref = ref(storage, file_url);

    // upload file
    const upload_result = await uploadBytes(file_ref, f);
    console.log(upload_result);
  });
}

/**
 * Gets files attached to a review from Firebase Storage
 * @param reviewId id of review containing the files
 * @returns list of download links
 */
export async function getFiles(reviewId: string) {
  const files: Object[] = [];

  // list files in review directory
  const list_ref = ref(storage, `reviews/${reviewId}`);
  const file_list = await listAll(list_ref);
  
  for (const i of file_list.items) {
    const link = await getDownloadURL(i);
    const metadata = await getMetadata(i);
   
    files.push({metadata, link});
  }

//console.log(files);
  return files;
}

/**
 * Deletes file(s) attached to a review from Firebase Storage
 * @param reviewId id of review containing the files
 * @param file (optional) name of SINGLE FILE to delete. If omitted, deletes all files attached to review.
 */
export async function deleteFiles(reviewId: string, file: string = "") {
  // if single file...
  if (file != "") {
    const file_url = `reviews/${reviewId}/${file}`;
    const file_ref = ref(storage, file_url);
    try {
      await deleteObject(file_ref);
    } catch {
      console.warn(`File ${file_url} does not exist`);
    }
  }
  // if entire directory...
  else {
    // list files in review directory
    const list_ref = ref(storage, `reviews/${reviewId}`);
    const file_list = await listAll(list_ref);
    console.log(file_list);

    file_list.items.forEach(async (r) => {
      await deleteObject(r);
    });
  }
}
