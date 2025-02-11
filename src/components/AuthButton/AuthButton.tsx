import React from "react";
import { Button } from "primereact/button";
import { auth } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@contexts/AuthContext/AuthContext";

const AuthButton: React.FC = () => {
  const { user, logout } = useAuth(); // Utilisation du contexte

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during login: ", error);
    }
  };

  return user ? (
    <Button label={`Logout (${user.displayName || "User"})`} onClick={logout} />
  ) : (
    <Button label="Login with Google" onClick={handleLogin} />
  );
};

export default AuthButton;
