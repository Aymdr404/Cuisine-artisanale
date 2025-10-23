import { useEffect, useState } from "react";

export default function Unsubscribe() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      setStatus("error");
      return;
    }

    // Appel à ta fonction Cloud HTTPS
    fetch(`https://us-central1-recettes-cuisine-a1bf2.cloudfunctions.net/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-orange-600 mb-4">🍪 Traitement en cours...</h1>
            <p>Veuillez patienter pendant que nous vous désabonnons.</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold text-orange-600 mb-4">Désabonnement réussi 🎉</h1>
            <p className="text-gray-700 mb-6">
              Vous avez été désabonné(e) de la newsletter <strong>Recettes Gourmandes</strong>.
            </p>
            <a
              href="https://aymeric-sabatier.fr/cuisine-artisanale"
              className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
            >
              Revenir sur le site
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oups 😢</h1>
            <p className="text-gray-700 mb-6">
              Impossible de vous désabonner. Le lien semble invalide ou a expiré.
            </p>
            <a
              href="https://aymeric-sabatier.fr/contact"
              className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
            >
              Contacter le support
            </a>
          </>
        )}
      </div>
    </div>
  );
}
