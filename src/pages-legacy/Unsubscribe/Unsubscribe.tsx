import { useEffect, useState } from "react";
import './Unsubscribe.css'

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
		.then(res => res.json())
		.then(data => {
			if (data.success) setStatus("success");
			else setStatus("error");
		})
		.catch(() => setStatus("error"));
  }, []);

  return (
	<div className="unsubscribe-container">
		<div className="unsubscribe-card">
			{status === "loading" && (
			<div className="loading status-content">
				<h1>🍪 Traitement en cours...</h1>
				<p>Veuillez patienter pendant que nous vous désabonnons.</p>
			</div>
			)}
			{status === "success" && (
			<div className="success status-content">
				<h1>Désabonnement réussi 🎉</h1>
				<p>
				Vous avez été désabonné(e) de la newsletter <strong>Cuisine Artisanale</strong>.
				</p>
				<a
				href="https://www.aymeric-sabatier.fr/Cuisine-artisanale"
				className="unsubscribe-button"
				>
				Revenir sur le site
				</a>
			</div>
			)}
			{status === "error" && (
			<div className="error status-content">
				<h1>Oups 😢</h1>
				<p>
				Impossible de vous désabonner. Le lien semble invalide ou a expiré.
				</p>
				<a
				href="https://www.aymeric-sabatier.fr/contact"
				className="unsubscribe-button"
				>
				Contacter le support
				</a>
			</div>
			)}
		</div>
	</div>
  );
}
