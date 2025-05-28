import React, { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./RecetteMap.css";

import { MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import L from "leaflet";
import { useNavigate } from 'react-router-dom';
import geojsonData from '@assets/departementsGeoJson.json';
import departementsCoordinates from '@assets/departementsCoord.json';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

interface Recette {
  recetteId: string;
  title: string;
  type: string;
  position: string;
  images?: string[];
  description?: string;
  url?: string;
}

interface DepartementFeature {
  properties: {
    nom: string;
    code: string;
  };
  geometry: {
    coordinates: number[][][];
  };
}

const RecetteMap: React.FC = () => {
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const [hoveredRecette, setHoveredRecette] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDepartement, setSelectedDepartement] = useState<string | null>(null);

  const db = getFirestore();
  const navigate = useNavigate();

  const recetteTypes = useMemo(() => [
    { label: 'Tous les types', value: null },
    { label: 'Entrée', value: 'Entrée' },
    { label: 'Plat', value: 'Plat' },
    { label: 'Dessert', value: 'Dessert' },
    { label: 'Boisson', value: 'Boisson' },
  ], []);

  const departements = useMemo(() => {
    const depts = geojsonData.features.map(feature => ({
      label: feature.properties.nom,
      value: feature.properties.code
    }));
    return [{ label: 'Tous les départements', value: null }, ...depts];
  }, []);

  useEffect(() => {
    fetchRecettes();
  }, []);

  const fetchRecettes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recettesData: Recette[] = querySnapshot.docs.map((doc) => ({
        title: doc.data().title,
        description: doc.data().description,
        position: doc.data().position,
        recetteId: doc.id,
        type: doc.data().type,
        images: doc.data().images ?? [],
        url: doc.data().url,
      }));
      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting recettes:", error);
    }
  };

  const filteredRecettes = useMemo(() => {
    return recettes.filter(recette => {
      const matchesSearch = recette.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || recette.type === selectedType;
      const matchesDepartement = !selectedDepartement || recette.position === selectedDepartement;
      return matchesSearch && matchesType && matchesDepartement;
    });
  }, [recettes, searchTerm, selectedType, selectedDepartement]);

  const getDepartementPolygon = (departementName: string): [number, number][] => {
    const departement = geojsonData.features.find(
      (feature) => feature.properties.nom === departementName
    ) as DepartementFeature | undefined;

    return departement 
      ? departement.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])
      : [];
  };

  const createMarkerIcon = (isHovered: boolean) => {
    const radius = isHovered ? 20 : 8;
    return L.divIcon({
      html: `
        <div class="custom-marker ${isHovered ? 'hovered' : ''}"
             style="width: ${radius * 2}px; height: ${radius * 2}px;">
        </div>
      `,
      className: '',
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius],
    });
  };

  return (
    <div className="recipe-map-container">
      <aside className="recipe-sidebar">
        <header className="sidebar-header">
          <h2>Découvrez nos recettes</h2>
          <div className="search-filters">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une recette..."
              />
            </span>
            <Dropdown
              value={selectedType}
              options={recetteTypes}
              onChange={(e) => setSelectedType(e.value)}
              placeholder="Type de plat"
              className="filter-dropdown"
            />
            <Dropdown
              value={selectedDepartement}
              options={departements}
              onChange={(e) => setSelectedDepartement(e.value)}
              placeholder="Département"
              className="filter-dropdown"
            />
          </div>
        </header>

        <div className="recipe-list">
          {filteredRecettes.length === 0 ? (
            <div className="no-results">
              <i className="pi pi-info-circle" />
              <p>Aucune recette ne correspond à votre recherche</p>
            </div>
          ) : (
            <ul>
              {filteredRecettes.map((recette) => (
                <li
                  key={recette.recetteId}
                  className={`recipe-item ${hoveredRecette === recette.recetteId ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredRecette(recette.recetteId)}
                  onMouseLeave={() => setHoveredRecette(null)}
                  onClick={() => navigate(`/recettes/${recette.url}`)}
                >
                  <div className="recipe-item-content">
                    {recette.images?.[0] && (
                      <div className="recipe-thumbnail">
                        <img src={recette.images[0]} alt={recette.title} />
                      </div>
                    )}
                    <div className="recipe-info">
                      <h3>{recette.title}</h3>
                      <span className="recipe-type">{recette.type}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="map-section">
        <MapContainer
          center={[46.603354, 1.888334]}
          zoom={6}
          scrollWheelZoom={false}
          className="map-container"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {geojsonData.features.map((departement, index) => (
            <Polygon
              key={index}
              positions={getDepartementPolygon(departement.properties.nom)}
              pathOptions={{
                color: selectedDepartement === departement.properties.code ? '#ff7800' : '#3388ff',
                weight: selectedDepartement === departement.properties.code ? 2 : 1,
                fillOpacity: 0.2
              }}
            >
              <Popup>{departement.properties.nom}</Popup>
            </Polygon>
          ))}

          {filteredRecettes.map((recette) => {
            const coordEntry = Object.entries(departementsCoordinates).find(
              ([code]) => code === recette.position
            );
            if (!coordEntry) return null;

            const coord = coordEntry[1] as [number, number];
            if (!Array.isArray(coord) || coord.length !== 2) return null;

            return (
              <Marker
                key={recette.recetteId}
                position={coord}
                icon={createMarkerIcon(hoveredRecette === recette.recetteId)}
                eventHandlers={{
                  mouseover: () => setHoveredRecette(recette.recetteId),
                  mouseout: () => setHoveredRecette(null),
                }}
              >
                <Popup>
                  <div className="recipe-popup">
                    {recette.images?.[0] && (
                      <img src={recette.images[0]} alt={recette.title} />
                    )}
                    <h3>{recette.title}</h3>
                    <p className="recipe-type">{recette.type}</p>
                    {recette.description && (
                      <p className="recipe-description">{recette.description}</p>
                    )}
                    <Button
                      icon="pi pi-eye"
                      label="Voir la recette"
                      onClick={() => navigate(`/recettes/${recette.url}`)}
                    />
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </main>
    </div>
  );
};

export default RecetteMap;
