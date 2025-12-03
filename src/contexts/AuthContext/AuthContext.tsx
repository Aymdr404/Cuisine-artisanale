import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@firebaseModule"; // Assure-toi que l'importation est correcte
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  displayName?: string | null;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
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

  const fetchUserDisplayName = async (userId: string, googleDisplayName: string | null) => {
	try {
	  const db = getFirestore();
	  const userRef = doc(db, "users", userId);
	  const userDoc = await getDoc(userRef);

	  // D'abord vérifier Firestore
	  if (userDoc.exists() && userDoc.data().displayName) {
		return userDoc.data().displayName;
	  }

	  // Sinon utiliser le displayName de Google
	  return googleDisplayName || null;
	} catch (err) {
	  console.error("Error fetching display name:", err);
	  return googleDisplayName || null;
	}
  };

  const createUserInFirestore = async (userId: string, email: string, displayName: string) => {
	const db = getFirestore();
	const userRef = doc(db, "users", userId);
	await setDoc(userRef, {
	  email: email,
	  role: "user",
	  createdAt: new Date(),
	  displayName: displayName
	});
  };

  const refreshUserData = async () => {
	if (!user) return;
	try {
	  const db = getFirestore();
	  const userRef = doc(db, "users", user.uid);
	  const userDoc = await getDoc(userRef);

	  if (userDoc.exists()) {
		const userData = userDoc.data();
		setRole(userData.role || null);
	  }

	  // Récupérer le displayName : d'abord Firestore, puis Google
	  const displayNameFromFirestore = await fetchUserDisplayName(user.uid, user.displayName);
	  setDisplayName(displayNameFromFirestore);
	} catch (err) {
	  console.error("Error refreshing user data:", err);
	  setError(err instanceof Error ? err.message : "Error refreshing user data");
	}
  };

  useEffect(() => {
	const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
	  try {
		if (currentUser) {
		  setUser(currentUser);

		  const userRole = await fetchUserRole(currentUser.uid);

		  if (!userRole) {
			await createUserInFirestore(currentUser.uid, currentUser.email || "", currentUser.displayName || "");
			setRole("user");
		  } else {
			setRole(userRole);
		  }

		  // Récupérer le displayName : d'abord Firestore, puis Google
		  const displayNameFromFirestore = await fetchUserDisplayName(currentUser.uid, currentUser.displayName);
		  setDisplayName(displayNameFromFirestore);
		} else {
		  setUser(null);
		  setRole(null);
		  setDisplayName(null);
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
		  await createUserInFirestore(result.user.uid, result.user.email || "", result.user.displayName || "");
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
	<AuthContext.Provider value={{ user, role, displayName, logout, signInWithGoogle, refreshUserData, loading, error }}>
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
