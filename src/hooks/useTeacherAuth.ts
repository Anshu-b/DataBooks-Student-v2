import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import { auth } from "../firebase/auth";

export function useTeacherAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function register(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = credential.user.uid;
    const db = getDatabase();

    // Create teacher record if first time
    await set(ref(db, `teachers/${uid}`), {
      email,
      createdAt: new Date().toISOString(),
      sessionsOwned: {},
    });

    return credential.user;
  }

  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  }

  async function logout() {
    await signOut(auth);
  }

  return {
    user,
    loading,
    register,
    login,
    logout,
  };
}
