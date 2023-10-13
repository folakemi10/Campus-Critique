import { User } from "firebase/auth";

export const useFirebaseUser = () => useState("firebaseUser", ()=>null as User | null);