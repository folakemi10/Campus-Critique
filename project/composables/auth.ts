import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  getAuth,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { FirebaseError } from "firebase/app";

/**
 * Logs in an existing user using Firebase Auth
 * @param email email of user
 * @param password unhashed password of user
 * @returns User if success, error if fail
 */
export async function login(email: string, password: string) {
  //console.log("Login");
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    onAuthStateChanged(auth, (user) => stateChange(user));
    return user;
  } catch (e: any) {
    return error(e);
  }
}

/**
 * Logs out a logged in user using Firebase Auth
 */
export async function logout() {
  console.log("Logout");
  try {
    const result = signOut(auth);
    return result;
  } catch (e: any) {
    return error(e);
  }
}

/**
 * Registers a new user using Firebase Auth
 * @param email email of new user
 * @param password unhashed password of new user
 * @returns New user if success, error if fail
 */
export async function register(email: string, password: string) {
  console.log("Register");
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    onAuthStateChanged(auth, (user) => stateChange(user));
    return user;
  } catch (e: any) {
    return error(e);
  }
}

/**
 * Gets the status of the current user
 * @returns User if success, error if fail
 */
export async function status() {
  try {
    return auth.currentUser;
  } catch (e: any) {
    return error(e);
  }
}

/**
 * Callback for onAuthStateChanged
 * @param user Current User (or null if not logged in)
 */
function stateChange(user: User | null) {
  console.log(user);
}

function error(e: any) {
  const fe = e as FirebaseError;
  return {
    code: fe.code,
    message: fe.message,
  };
}

export const initUser = async () => {
  const auth = getAuth();
  const firebaseUser = useFirebaseUser();
  firebaseUser.value = auth.currentUser;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Auth changed: " + user.email);
    } else {
      console.log("auth change");
    }

    firebaseUser.value = user;
  });
};
