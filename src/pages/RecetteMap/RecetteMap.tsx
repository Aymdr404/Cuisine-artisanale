import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

import { MapContainer, Marker, Polygon, Popup, TileLayer,  } from 'react-leaflet';
import L from "leaflet";
import { useNavigate } from 'react-router-dom';
import geojsonData from './departementsGeoJson.json';
import departementsCoordinates from './departementsCoord.json';

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

  return (

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
      const coord = coordEntry[1];

      const handleNavigate = () => {
        navigate(`/recette/${recette.recetteId}`);
      };

      if (Array.isArray(coord) && coord.length === 2) {
        return (
          <Marker key={index} position={coord as [number, number]} icon={customIcon}>
            <Popup>
              <strong>{recette.title}</strong>
              <br />
              <button onClick={handleNavigate}>Voir la recette</button>
            </Popup>
          </Marker>
        );
      }
      return null;
    })}
    </MapContainer>
  );
};

export default RecetteMap;
