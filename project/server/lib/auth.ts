import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "./firebase"
import { FirebaseError } from "firebase/app";

/**
 * Registers a new user using Firebase Auth
 * @param email email of new user
 * @param password unhashed password of new user
 * @returns New user if success, error if fail
 */
export async function register(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    }
    catch(error: any) {
        console.log(error);

        const fe = error as FirebaseError;
        return { 
            code: fe.code,
            message: fe.message
        }
    }
}