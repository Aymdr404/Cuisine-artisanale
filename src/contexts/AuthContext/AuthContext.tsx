import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@firebaseModule"; // Assure-toi que l'importation est correcte
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  };

  const createUserInFirestore = async (userId: string, email: string) => {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: email,
      role: "user",
      createdAt: new Date(),
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);

          const userRole = await fetchUserRole(currentUser.uid);

          if (!userRole) {
            await createUserInFirestore(currentUser.uid, currentUser.email || "");
            setRole("user");
          } else {
            setRole(userRole);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setRole(null);
      window.location.href = "/Cuisine-artisanale/";
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err instanceof Error ? err.message : "Error signing out");
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const userRole = await fetchUserRole(result.user.uid);
        if (!userRole) {
          await createUserInFirestore(result.user.uid, result.user.email || "");
          setRole("user");
        }
      }
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError(err instanceof Error ? err.message : "Error signing in with Google");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, logout, signInWithGoogle, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
