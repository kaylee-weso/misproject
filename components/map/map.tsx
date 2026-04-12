"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Feature, FeatureCollection, Point } from "geojson";

// Types
type FacilityProperties = {
  Company?: string;
  Full_Address?: string;
  Certification?: string;
  Website?: string;
};

type Facility = Feature<Point, FacilityProperties>;
type FacilitiesGeoJSON = FeatureCollection<Point, FacilityProperties>;

export default function MapComponent() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [allFacilities, setAllFacilities] = useState<FacilitiesGeoJSON | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const usStates = new Set([
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
    "WI","WY"
  ]);

  // Fetch GeoJSON and initialize map
  useEffect(() => {
    fetch("/map/facilities_combined_updated.geojson") // match public folder
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: FacilitiesGeoJSON) => {
        setAllFacilities(data);

        const mapInstance = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v12",
          center: [-98, 39],
          zoom: 3,
        });

        mapInstance.on("load", () => {
          mapInstance.addSource("facilities", { type: "geojson", data });
          mapInstance.addLayer({
            id: "facility-points",
            type: "circle",
            source: "facilities",
            paint: {
              "circle-radius": 6,
              "circle-color": "#2E8B57",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          });

          setMapLoaded(true);
        });

        setMap(mapInstance);
      })
      .catch(err => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Hover popup
  useEffect(() => {
    if (!map || !mapLoaded) return;

    const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features![0];
      if (feature.geometry.type === "Point") {
        const coords = feature.geometry.coordinates as [number, number];
        const props = feature.properties as FacilityProperties;

        hoverPopup
          .setLngLat(coords)
          .setHTML(`
            <strong>${props?.Company || "N/A"}</strong><br/>
            ${props?.Full_Address || "N/A"}<br/>
            Certification: ${props?.Certification || "N/A"}<br/>
            Website: ${props?.Website ? `<a href="${props.Website}" target="_blank">${props.Website}</a>` : "N/A"}
          `)
          .addTo(map);
      }
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      hoverPopup.remove();
    };

    map.on("mouseenter", "facility-points", handleMouseEnter);
    map.on("mouseleave", "facility-points", handleMouseLeave);

    return () => {
      map.off("mouseenter", "facility-points", handleMouseEnter);
      map.off("mouseleave", "facility-points", handleMouseLeave);
    };
  }, [map, mapLoaded]);

  // Click popup + zoom
  useEffect(() => {
    if (!map || !mapLoaded) return;

    const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const feature = e.features![0];
      if (feature.geometry.type === "Point") {
        const coords = feature.geometry.coordinates as [number, number];
        const props = feature.properties as FacilityProperties;

        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(`
            <strong>${props?.Company || "N/A"}</strong><br/>
            ${props?.Full_Address || "N/A"}<br/>
            Certification: ${props?.Certification || "N/A"}<br/>
            Website: ${props?.Website ? `<a href="${props.Website}" target="_blank">${props.Website}</a>` : "N/A"}
          `)
          .addTo(map);

        map.flyTo({ center: coords, zoom: 14 });
      }
    };

    map.on("click", "facility-points", handleClick);

    return () => {
      map.off("click", "facility-points", handleClick);
    };
  }, [map, mapLoaded]);

  // Filter facilities
  useEffect(() => {
    if (!map || !allFacilities || !mapLoaded) return;

    const filtered: FacilitiesGeoJSON = {
      type: "FeatureCollection",
      features: allFacilities.features.filter((f: any) => {
        const addr = f.properties?.Full_Address || "";
        const parts = addr.split(",").map((s: any) => s.trim());
        const state = parts.find((p: any) => usStates.has(p.toUpperCase()));
        const stateMatch = !selectedState || (state && state.toUpperCase() === selectedState);
        const searchMatch =
          !searchTerm ||
          (f.properties?.Company && f.properties.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
          addr.toLowerCase().includes(searchTerm.toLowerCase());
        return stateMatch && searchMatch;
      }),
    };

    const source = map.getSource("facilities") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(filtered);

    if (filtered.features.length > 0) {
      const bounds = filtered.features.reduce((b: any, f: any) => {
        const [lng, lat] = f.geometry.coordinates as [number, number];
        return b.extend([lng, lat]);
      }, new mapboxgl.LngLatBounds(filtered.features[0].geometry.coordinates as [number, number], filtered.features[0].geometry.coordinates as [number, number]));

      map.fitBounds(bounds, { padding: 50, maxZoom: searchTerm ? 14 : 12 });
    }
  }, [selectedState, searchTerm, map, allFacilities, mapLoaded]);

  // State options
  const stateOptions = Array.from(
    new Set(
      allFacilities?.features
        .map(f => {
          const addr = f.properties?.Full_Address || "";
          const parts = addr.split(",").map((s: any) => s.trim());
          return parts.find((p: any) => usStates.has(p.toUpperCase()));
        })
        .filter(Boolean)
    )
  ).sort() as string[];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Controls */}
      <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1,
        background: "white",
        padding: 10,
        borderRadius: 5,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <label>
        State:
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
          <option value="">-- All States --</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <label>
        Search:
        <input
          type="text"
          value={searchTerm}
          placeholder="Company or Address"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </label>

      <button
        onClick={() => {
          if (!map || !allFacilities || allFacilities.features.length === 0) return;

          const bounds = allFacilities.features.reduce((b, f) => {
            const [lng, lat] = f.geometry.coordinates as [number, number];
            return b.extend([lng, lat]);
          }, new mapboxgl.LngLatBounds(
            allFacilities.features[0].geometry.coordinates as [number, number],
            allFacilities.features[0].geometry.coordinates as [number, number]
          ));

          map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
        }}
        style={{
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#f9f9f9",
          cursor: "pointer",
        }}
      >
        Reset Zoom
      </button>
    </div>

      {/* Map */}
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}