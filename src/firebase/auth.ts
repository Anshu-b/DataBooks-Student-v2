import { getAuth, signInAnonymously } from "firebase/auth";

export const auth = getAuth();
signInAnonymously(auth);