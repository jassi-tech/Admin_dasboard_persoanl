"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import styles from "./UserMap.module.scss";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default?.src || require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png").default?.src || require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png").default?.src || require("leaflet/dist/images/marker-shadow.png"),
});

const MapContent = ({ locations }: { locations: [number, number, string][] }) => {
    const map = useMap();
    
    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc[0], loc[1]]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    return (
        <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.map((loc, idx) => (
                <Marker key={idx} position={[loc[0], loc[1]]}>
                    <Popup>{loc[2]}</Popup>
                </Marker>
            ))}
        </>
    );
};

const UserMap = () => {
    const [isClient, setIsClient] = useState(false);
    const [locations, setLocations] = useState<[number, number, string][]>([]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ;
        fetch(`${API_URL}/locations`)
            .then((res) => res.json())
            .then((data) => setLocations(data))
            .catch((err) => console.error('Failed to load locations', err));
    }, []);


    if (!isClient) return null;

    return (
        <div className={styles.mapWrapper}>
            <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} className={styles.mapContainer}>
                <MapContent locations={locations} />
            </MapContainer>
        </div>
    );
};

export default UserMap;
