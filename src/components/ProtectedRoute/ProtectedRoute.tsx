import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import { db } from "@firebaseModule"; // Import Firestore

import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext/AuthContext";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setRole(userSnap.data().role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading) return <p>Chargement...</p>; // Afficher un loader pendant la récupération des infos

  if (!user || role !== "admin") {
    return <Navigate to="/" replace />; // Redirige vers la page d'accueil si pas admin
  }

  return <Outlet />; // Affiche la page demandée si admin
};

export default ProtectedRoute;
