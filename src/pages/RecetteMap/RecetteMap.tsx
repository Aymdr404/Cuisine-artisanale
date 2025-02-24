import React, { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./RecetteMap.css";

import { MapContainer, Marker, Polygon, Popup, TileLayer,  } from 'react-leaflet';
import L from "leaflet";
import { useNavigate } from 'react-router-dom';
import geojsonData from '@assets/departementsGeoJson.json';
import departementsCoordinates from '@assets/departementsCoord.json';
import { Button } from "primereact/button";

interface Recette {
  recetteId: string;
  title: string;
  type: string;
  position: string;
}

const RecetteMap = () => {
  
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const db = getFirestore();
  const navigate = useNavigate();
  const [hoveredRecette, setHoveredRecette] = useState<string | null>(null); // Etat pour gérer le survol de la recette

  React.useEffect(() => {
    fetchRecettes();
  }, []);

  const fetchRecettes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recettesData: Recette[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          description: data.description,
          position: data.position,
          recetteId: doc.id,
          type: data.type,
        } as Recette;
      });
      setRecettes(recettesData);
    }
    catch (error) {
      console.error("Error getting recettes: ", error);
    }
  };

  const getDepartementPolygon = (DepartementName: string) => {
    const departement = geojsonData.features.find((feature) => feature.properties.nom === DepartementName);
    return departement ? departement.geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]) : [];
  };

  const handleMarkerHover = (id: string) => {
    setHoveredRecette(id);
  };

  // Fonction pour rediriger vers la recette
  const handleClick = (title: string) => {
    navigate(`/recettes/${title}`);
  };


  return (
    <section className="map">
      <div className="recette-container" style={{ textAlign: 'center', overflowY: 'scroll' }}>
        <h3>Liste des Recettes</h3>
        <ul>
          {recettes.map((recette) => (
            <li
              key={recette.recetteId}
              style={{ padding: '5px', cursor: 'pointer' }}
              onMouseEnter={() => handleMarkerHover(recette.recetteId)}
              onMouseLeave={() => setHoveredRecette(null)}
              onClick={() => handleClick(recette.title)}
            >
              {recette.title}
            </li>
          ))}
        </ul>
      </div>

      <MapContainer center={[46.603354, 1.888334]} zoom={6} scrollWheelZoom={false} className="map-container"  >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geojsonData.features.map((departement, index) => (
          <Polygon key={index} positions={getDepartementPolygon(departement.properties.nom)} color="blue" weight={1}>
            <Popup>{departement.properties.nom}</Popup>
          </Polygon>
      ))}
      {recettes.map((recette) => {
        const coordEntry = Object.entries(departementsCoordinates).find(([code]) => code === recette.position);
        if (!coordEntry) return null;
        const coord: [number, number] = coordEntry[1] as [number, number];

        const handleNavigate = () => {
          navigate(`/recettes/${recette.recetteId}`);
        };

        const markerRadius = recette.recetteId === hoveredRecette ? 20 : 8;
        const markerIcon = L.divIcon({
          html: `<div style="background-color: #ff7800; width: ${markerRadius * 2}px; height: ${markerRadius * 2}px; border-radius: 50%; border: 1px solid #ff7800; opacity: 0.7;"></div>`,
          className: '',
          iconSize: [markerRadius * 2, markerRadius * 2], // Taille de l'icône en fonction du rayon
          iconAnchor: [markerRadius, markerRadius], // L'ancrage de l'icône est au centre pour éviter le décalage
        });

        if (Array.isArray(coord) && coord.length === 2) {
          return (
            <Marker
              key={recette.recetteId}
              position={coord}
              eventHandlers={{
                mouseover: () => handleMarkerHover(recette.recetteId),
                mouseout: () => setHoveredRecette(null),
              }}
              icon={markerIcon}
            >
            <Popup>
              <strong>{recette.title}</strong>
              <p>{recette.type}</p>
              <br />
              <Button onClick={handleNavigate}>Voir la recette</Button>
            </Popup>
          </Marker>
          );
        }
        return null;
      })}
      </MapContainer>
    </section>
  );
};

export default RecetteMap;
