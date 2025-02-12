import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./RecetteMap.css";

import { MapContainer, Marker, Polygon, Popup, TileLayer,  } from 'react-leaflet';
import L from "leaflet";
import { useNavigate } from 'react-router-dom';
import geojsonData from './departementsGeoJson.json';
import departementsCoordinates from './departementsCoord.json';
import { Button } from "primereact/button";

interface Recette {
  recetteId: string;
  title: string;
  position: string;
}

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448592.png",
  iconSize: [30, 30],
});

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
          recetteId: doc.id
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
  const handleClick = (id: string) => {
    navigate(`/recettes/${id}`);
  };


  return (
    <section className="map">
      <div style={{ width: '250px', marginRight: '20px', height: '80vh', overflowY: 'scroll' }}>
        <h3>Liste des Recettes</h3>
        <ul>
          {recettes.map((recette) => (
            <li
              key={recette.recetteId}
              style={{ padding: '5px', cursor: 'pointer' }}
              onMouseEnter={() => handleMarkerHover(recette.recetteId)}  // Survol de la recette
              onClick={() => handleClick(recette.recetteId)}  // Clic sur la recette
            >
              {recette.title}
            </li>
          ))}
        </ul>
      </div>

      <MapContainer center={[46.603354, 1.888334]} zoom={6} scrollWheelZoom={false} 
        style={{ height:"80vh",backgroundColor:"white", width:"80vw",
            }} >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geojsonData.features.map((departement, index) => (
          <Polygon key={index} positions={getDepartementPolygon(departement.properties.nom)} color="blue" weight={1}>
            <Popup>{departement.properties.nom}</Popup>
          </Polygon>
      ))}
      {recettes.map((recette, index) => {
        const coordEntry = Object.entries(departementsCoordinates).find(([code]) => code === recette.position);
        console.log(coordEntry);
        if (!coordEntry) return null;
        const coord: [number, number] = coordEntry[1] as [number, number];

        const handleNavigate = () => {
          navigate(`/recettes/${recette.recetteId}`);
        };

        if (Array.isArray(coord) && coord.length === 2) {
          return (
            <Marker
              key={recette.recetteId}
              position={coord}
              eventHandlers={{
                mouseover: () => handleMarkerHover(recette.recetteId),  // Survol du marker
                mouseout: () => setHoveredRecette(null),  // Quand on quitte le survol
              }}
              icon={customIcon}
            >
            <Popup>
              <strong>{recette.title}</strong>
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
