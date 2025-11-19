"use client";
import React from 'react';
import './LegalMentions.css';

const LegalMentions: React.FC = () => {
  return (
	<div className="LegalMentions-container">
	  <h1>Mentions légales</h1>

	  <section>
		<h2>Éditeur du site</h2>
		<p>
		  Le site <strong><a href="https://www.aymeric-sabatier.fr/Cuisine-artisanale">Cuisine-artisanale</a></strong>
		  est édité par <strong>Aymeric Sabatier</strong>.
		</p>
		<ul>
		  <li>Statut : Particulier (projet personnel)</li>
		  <li>Email : <a href="mailto:ssabatieraymeric@gmail.com">ssabatieraymeric@gmail.com</a></li>
		  <li>Adresse : France</li>
		</ul>
		<p>
		  Ce site est à but non commercial, et a pour objectif le partage de recettes et de publications culinaires.
		</p>
	  </section>

	  <section>
		<h2>Hébergement</h2>
		<p>
		  Le site est actuellement hébergé sur <strong>GitHub Pages</strong> :
		</p>
		<ul>
		  <li>GitHub, Inc.</li>
		  <li>88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis</li>
		  <li>Site web : <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">https://pages.github.com</a></li>
		</ul>
		<p>
		  Le site pourra ultérieurement être hébergé sur un NAS personnel.
		</p>
	  </section>

	  <section>
		<h2>Propriété intellectuelle</h2>
		<p>
		  L’ensemble des contenus présents sur le site (textes, images, recettes, graphismes, logos, etc.)
		  sont la propriété exclusive de Aymeric Sabatier, sauf mention contraire.
		  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site,
		  quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
		</p>
	  </section>

	  <section>
		<h2>Responsabilité</h2>
		<p>
		  L’éditeur s’efforce de fournir des informations exactes et à jour, mais ne saurait être tenu responsable
		  des erreurs ou omissions, ni d’une indisponibilité du service.
		</p>
		<p>
		  L’utilisateur reconnaît utiliser le site sous sa responsabilité exclusive.
		</p>
	  </section>
	</div>
  );
};

export default LegalMentions;
