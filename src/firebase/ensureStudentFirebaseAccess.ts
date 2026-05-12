import { signInAnonymously } from "firebase/auth";
import { auth } from "./auth";

/**
 * Gives students a Firebase identity without asking them to log in.
 *
 * Teacher accounts remain normal email/password users. This only creates an
 * anonymous auth session when no Firebase user exists in the current browser.
 */
export async function ensureStudentFirebaseAccess() {
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}
