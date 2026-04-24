import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { auth } from "../firebase/auth";

type AuthResult = Promise<User>;

const PASSWORD_RESET_URL =
  "https://dataorganismsstudent-v2.netlify.app/teacher/login";

export function useTeacherAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  async function register(email: string, password: string): AuthResult {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await createTeacherRecord(credential.user.uid, email);

    return credential.user;
  }

  async function login(email: string, password: string): AuthResult {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return credential.user;
  }

  async function logout(): Promise<void> {
    await signOut(auth);
  }

  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email, {
      url: PASSWORD_RESET_URL,
      handleCodeInApp: false,
    });
  }

  return {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
  };
}

async function createTeacherRecord(uid: string, email: string): Promise<void> {
  const db = getDatabase();

  await set(ref(db, `teachers/${uid}`), {
    email,
    createdAt: new Date().toISOString(),
    sessionsOwned: {},
  });
}