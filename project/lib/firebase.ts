import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOVbSES8El9FN5czuT9WIelI1XBu-N9NA",
  authDomain: "cse437-46fb9.firebaseapp.com",
  projectId: "cse437-46fb9",
  storageBucket: "cse437-46fb9.appspot.com",
  messagingSenderId: "418494435440",
  appId: "1:418494435440:web:13cba937ccfea5b416e4b5"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

