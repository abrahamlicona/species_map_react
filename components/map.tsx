"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple } from "leaflet";
import Papa from "papaparse";

// Fix Leaflet icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MyMap({
  height,
  position,
  zoom,
}: {
  height: string;
  position: LatLngTuple;
  zoom: number;
}) {
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      style={{ height: height, width: "100%", zIndex: 0 }}
      className="rounded-md"
      attributionControl={false}
      minZoom={8}
      // Pass maxBoundsViscosity as an option here
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
      />

      <MapContent />
    </MapContainer>
  );
}

function MapContent() {
  const map = useMap();

  useEffect(() => {
    // Set the map's max bounds (expanded for Mexico and sea)
    const bounds: LatLngTuple[] = [
      [16.0, -94.0],
      [24.0, -84.0],
    ];
    map.setMaxBounds(bounds as any);

    const loadData = async () => {
      // Helper: Parse CSV file via PapaParse
      const parseCsv = (url: string): Promise<any[]> =>
        new Promise((resolve) => {
          Papa.parse(url, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
          });
        });

      const speciesData = await parseCsv("/data_species.csv");
      const cenotesData = await parseCsv("/data_cenotes.csv");
      const fishData = await parseCsv("/data_fish.csv");

      speciesData.forEach((row) => {
        const lat = parseFloat(row.latitude);
        const lon = parseFloat(row.longitud);
        if (isNaN(lat) || isNaN(lon)) return;

        const species: string[] = [];
        const cenotes: string[] = [];
        const fishes: string[] = [];

        // Extract species info
        Object.keys(row).forEach((key) => {
          if (key !== "latitude" && key !== "longitud" && row[key] == 1) {
            species.push(key);
          }
        });

        // Find corresponding cenotes row by matching coordinates
        const match = cenotesData.find(
          (c) =>
            parseFloat(c.latitude) === lat && parseFloat(c.longitud) === lon
        );
        if (match) {
          Object.keys(match).forEach((key) => {
            if (key !== "latitude" && key !== "longitud" && match[key] == 1) {
              cenotes.push(key);
            }
          });
        }

        const fishRow = fishData.find(
          (f) =>
            parseFloat(f.latitude) === lat && parseFloat(f.longitud) === lon
        );
        if (fishRow) {
          Object.keys(fishRow).forEach((key) => {
            if (key !== "latitude" && key !== "longitud" && fishRow[key] == 1) {
              fishes.push(key);
            }
          });
        }

        // Calculate total info count and assign color
        const totalInfo = species.length + cenotes.length + fishes.length;
        const getColor = (infoCount: number) => {
          if (infoCount >= 5) return "green";
          if (infoCount === 4) return "yellowgreen";
          if (infoCount === 3) return "yellow";
          if (infoCount === 2) return "orange";
          if (infoCount === 1) return "red";
          return "gray";
        };

        // Prepare popup text
        const popupText = `
        <strong>Coordenadas:</strong> ${lat.toFixed(5)}, ${lon.toFixed(5)}<br>
        ${
          species.length + fishes.length
            ? "<strong>Especies:</strong> " +
              [...species, ...fishes].join(", ") +
              "<br>"
            : "No hay especies para esta coordenada<br>"
        }
        ${
          cenotes.length
            ? "<strong>Cenotes:</strong> " + cenotes.join(", ") + "<br>"
            : "No hay cenotes para esta coordenada<br>"
        }
      `;

        // Add a circle marker with color and popup
        L.circleMarker([lat, lon], {
          radius: 5,
          color: getColor(totalInfo),
          fillColor: getColor(totalInfo),
          fillOpacity: 0.6,
        })
          .bindPopup(popupText)
          .addTo(map);
      });

      // Draw grid lines similar to your HTML version
      const latStep = 0.125;
      const lonStep = 0.125;

      // Horizontal grid lines
      for (let lat = 16.0; lat <= 24.0; lat += latStep) {
        L.polyline(
          [
            [lat, -94.0],
            [lat, -84.0],
          ],
          { color: "gray", weight: 1 }
        ).addTo(map);
      }

      // Vertical grid lines
      for (let lon = -94.0; lon <= -84.0; lon += lonStep) {
        L.polyline(
          [
            [16.0, lon],
            [24.0, lon],
          ],
          { color: "gray", weight: 1 }
        ).addTo(map);
      }
    };

    loadData();
  }, [map]);

  return null;
}
