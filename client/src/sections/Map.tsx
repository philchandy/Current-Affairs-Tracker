"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L, { Layer } from 'leaflet';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '@/components/LoadingScreen';
import ToggleSwitch from '@/components/ToggleSwitch';
import Drawer from '@/components/Drawer'; 
import dynamic from 'next/dynamic';
import { FaArrowUp } from 'react-icons/fa';

// Define types for event and API response
interface Event {
    country: string;
    description: string;
    severityScore: any;
    mediaScore: any;
  }
  
  interface ApiResponse {
    data: Region[];
  }
  
  interface Region {
    Events: Event[];
  }

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });

export const MapSection = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [worldGeoJSON, setWorldGeoJSON] = useState<GeoJSON.GeoJsonObject | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [scoreType, setScoreType] = useState<'severity' | 'media'>('severity');
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false); // State for drawer

    
    

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response: ApiResponse = await axios.get('http://localhost:3001/api/scrape');
                const flattenedEvents = response.data.flatMap(region => region.Events);
                setEvents(flattenedEvents);

                if (flattenedEvents.length === 0){
                    setLoading(false);
                } else {
                    setLoading(false);
                }
                
            } catch (error) {
                console.error("Error Fetching Data: ", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchGeoJSON = async () => {
            try{
                const countryResponse = await axios.get('/countries.geojson');
                setWorldGeoJSON(countryResponse.data)
            } catch (error) {
                console.error("Error Fetching GeoJSON: ", error)
            }
        };

        fetchGeoJSON();
    }, []);

    const eventCountries = events.map(event => event.country.toLowerCase());

    // Get the maximum severity score for normalization
    const maxSeverityScore = Math.max(...events.map(event => event.severityScore), 0); // Ensure it's not less than 0

    const getSeverityByCountry = (countryName: string) => {
        const event = events.find(event => event.country.toLowerCase() === countryName.toLowerCase());
        return event ? event.severityScore : 0; // Return severity score if found, else 0
    };

    const getColorForSeverity = (severity: number) => {
        const ratio = severity / maxSeverityScore || 0;
        const redValue = Math.floor(255 * ratio);
        return `rgb(${redValue}, 0, 0)`;
    }

    const maxMediaScore = Math.max(...events.map(event => event.mediaScore), 0); // Ensure it's not less than 0

    const getMediaByCountry = (countryName: string) => {
        const event = events.find(event => event.country.toLowerCase() === countryName.toLowerCase());
        return event ? event.mediaScore : 0;
    };

    const getColorForMedia = (media: number) => {
        const ratio = media / maxMediaScore || 0;
        const blueValue = Math.floor(255 * ratio);
        return `rgb(0, 0, ${blueValue})`;
    }


    const countryStyle = (feature:any): L.PathOptions => {
        const countryName = feature.properties?.ADMIN?.toLowerCase();
        const score = scoreType === 'severity' ? getSeverityByCountry(countryName) : getMediaByCountry(countryName); // Use selected score type
        const color = scoreType === 'severity' ? getColorForSeverity(score) : getColorForMedia(score); // Determine color based on score type

        return {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    const clickCountry = (feature: any, layer: Layer) => {
        const countryName = feature.properties?.ADMIN;
        layer.on({
            click:()=>{
                if (eventCountries.includes(countryName?.toLowerCase())){
                    if (selectedCountry !== countryName){
                        setSelectedCountry(countryName.toLowerCase());
                    }
                    setIsSidebarOpen(true);
                } else {
                    setIsSidebarOpen(false)
                } 
            },
        });
        console.log(events)
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    };

    const handleEventClick = (country: string) => {
        setSelectedCountry(country.toLowerCase());
        setIsSidebarOpen(true);
    }

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="App relative">

            {/* toggle switch */}
            <div className="absolute top-4 right-4 bg-gray-900/70 rounded-xl shadow-lg p-2 z-[1000]">
                <ToggleSwitch 
                    checked={scoreType === 'media'} 
                    onChange={() => setScoreType(scoreType === 'severity' ? 'media' : 'severity')}
                />
            </div>

            {/* drawer */}
            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} /> 

            <Sidebar 
                events={events} 
                selectedCountry={selectedCountry} 
                setSelectedCountry={setSelectedCountry} 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />

            <div className="flex justify-center items-center flex-col min-h-screen">
                <div className='' style={{ height: '100vh', width: '100%' }}>
                    <MapContainer 
                    center={[20, 0]} 
                    zoom={2} 
                    className='' 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using CartoDB Positron
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

                    />
                    {worldGeoJSON && (
                        <GeoJSON
                        data={worldGeoJSON}
                        style={countryStyle}
                        onEachFeature={clickCountry}
                        />
                    )}
                    </MapContainer>
                </div>
            </div>
            {/* Drawer */}
            {!isDrawerOpen && ( // Only show the arrow up button when the drawer is closed
                <div 
                    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-900/70 rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-500 transition"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <FaArrowUp className="text-xl text-white" />
                </div>
            )}
        </div>
    );
}