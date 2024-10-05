"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L, { Layer } from 'leaflet';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '@/components/LoadingScreen';
import Drawer from '@/components/Drawer'; 
import EventCard from '@/components/EventCard';
import dynamic from 'next/dynamic';
import { FaArrowUp, FaInfoCircle } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import Draggable from 'react-draggable';

// Define types for event and API response
interface Event {
    country: string;
    description: string;
    detailedDescription: string;
    severityScore: any;
    mediaScore: any;
    normalizedDifference: any;
}

interface ApiResponse {
    data: Region[];
}

interface Region {
    Events: Event[];
    Correlation: any;
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
    const [scoreType, setScoreType] = useState<'severity' | 'media' | 'normalizedDifference'>('severity');
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isEventCardOpen, setIsEventCardOpen ] = useState<boolean>(false);
    const [regionCorrelation, setRegionCorrelation] = useState<{ [key: string]: number | null }>({});
    const [showCorrelations, setShowCorrelations] = useState(false);

    
    

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response: ApiResponse = await axios.get('http://localhost:3001/api/scrape');
                const flattenedEvents = response.data.flatMap((region) => {

                    const regionWithName = region as Region & { Region: string }; //dumb typescript, make sure region has region

                    const correlation = region.Correlation !== null ? region.Correlation : 0; 
                    setRegionCorrelation(prev => ({
                        ...prev,
                        [regionWithName.Region]: correlation
                    }));
        
                    return regionWithName.Events;
                });
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

    //maximum severity score for normalization
    const maxSeverityScore = Math.max(...events.map(event => event.severityScore), 0); // Ensure it's not less than 0

    const getSeverityByCountry = (countryName: string) => {
        const event = events.find(event => event.country.toLowerCase() === countryName.toLowerCase());
        return event ? event.severityScore : 0; 
    };

    const getColorForSeverity = (severity: number) => {
        const ratio = severity / maxSeverityScore || 0; 
        const redValue = Math.floor(139 + (255 - 139) * (1 - ratio)); 
        const greenValue = Math.floor(0 + (229 - 0) * (1 - ratio)); 
        const blueValue = Math.floor(0 + (229 - 0) * (1 - ratio)); 
        
        return `rgb(${redValue}, ${greenValue}, ${blueValue})`; 
    };

    const maxMediaScore = Math.max(...events.map(event => event.mediaScore), 0); // Ensure it's not less than 0

    const getMediaByCountry = (countryName: string) => {
        const event = events.find(event => event.country.toLowerCase() === countryName.toLowerCase());
        return event ? event.mediaScore : 0;
    };

    const getColorForMedia = (media: number) => {
        const ratio = media / maxMediaScore || 0;
        const redValue = Math.floor(50 * ratio);  
        const blueValue = Math.floor(150 + 105 * ratio); 
        const greenValue = Math.floor(200 * (1 - ratio)); 

        return `rgb(${redValue}, ${greenValue}, ${blueValue})`;
    }

    const getNormalizedDifferenceByCountry = (countryName: string) => {
        const event = events.find(event => event.country.toLowerCase() === countryName.toLowerCase());
        return event ? event.normalizedDifference : 0;
    }

    const getColorForNormalizedDifference = (normalizedDifference: number) => {
        const ratio = normalizedDifference; //assuming normalizedDifference is between -1 and 1
        const redValue = Math.floor(255 * (ratio < 0 ? -ratio : 0));
        const blueValue = Math.floor(255 * (ratio > 0 ? ratio : 0));
        return `rgb(${redValue}, 0, ${blueValue})`;
    };


    const countryStyle = (feature: any): L.PathOptions => {
        const countryName = feature.properties?.ADMIN?.toLowerCase();
        let score = 0;
        let color = '';

        switch (scoreType) {
            case 'severity':
                score = getSeverityByCountry(countryName);
                color = getColorForSeverity(score);
                break;
            case 'media':
                score = getMediaByCountry(countryName);
                color = getColorForMedia(score);
                break;
            case 'normalizedDifference':
                score = getNormalizedDifferenceByCountry(countryName);
                color = getColorForNormalizedDifference(score);
                break;
            default:
                break;
        }

        // If the score is 0 or undefined, do not apply a fill color
        if (score === 0 || score === undefined) {
            return {
                fillColor: 'transparent',
                weight: 1,
                opacity: 1,
                color: '#4b5563',
                dashArray: '3',
                fillOpacity: 0
            };
        }

        return {
            fillColor: color,
            weight: 1,
            opacity: 1,
            color: '#4b5563',
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
        const event = events.find(event => event.country.toLowerCase() === country.toLowerCase());
        if (event) {
            setSelectedEvent(event);
            setIsEventCardOpen(true);
        }
        setSelectedCountry(country.toLowerCase());
    };

    const closeEventCard = () => {
        setSelectedEvent(null);
        setIsEventCardOpen(false);
    };

    const handleMapClick = () => {
        if (isEventCardOpen) {
          closeEventCard();
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="App relative">

            {/* Radio group for selecting score type */}
            <div className="absolute top-4 right-4 bg-gray-900/70 rounded-xl shadow-lg p-2 z-[1000]">
                <fieldset className="flex space-x-4 sm:flex-col md:flex-row">
                    <legend className="sr-only">Select Score Type</legend>
                    <label className="text-white">
                        <input
                            type="radio"
                            value="severity"
                            checked={scoreType === 'severity'}
                            onChange={() => setScoreType('severity')}
                            className="mr-2"
                        />
                        Severity Score
                    </label>
                    <label className="text-white">
                        <input
                            type="radio"
                            value="media"
                            checked={scoreType === 'media'}
                            onChange={() => setScoreType('media')}
                            className="mr-2"
                        />
                        Media Score
                    </label>
                    <label className="text-white">
                        <input
                            type="radio"
                            value="normalizedDifference"
                            checked={scoreType === 'normalizedDifference'}
                            onChange={() => setScoreType('normalizedDifference')}
                            className="mr-2"
                        />
                        Normalized Difference
                    </label>
                </fieldset>
            </div>

            {/* drawer */}
            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} /> 

            <Sidebar 
                events={events} 
                selectedCountry={selectedCountry} 
                setSelectedCountry={setSelectedCountry} 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                onEventClick={handleEventClick}
                isEventCardOpen={isEventCardOpen}
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

            {/* Region Correlations */}
            <div className="fixed lg:bottom-4 lg:right-4 sm:right-4 z-[1000]">
                {!showCorrelations && (
                    <button
                        onClick={() => setShowCorrelations(true)} // Show correlations when clicked
                        className="bg-gray-900/70 text-white px-4 py-2 rounded-lg shadow-lg hover:text-gray-400"
                    >
                        Show Correlations
                    </button>
                )}

                {showCorrelations && (
                    <div className=" bg-gray-900/70 p-4 rounded-lg shadow-lg mt-2 max-w-xs">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white text-lg font-bold">Correlation by Region</h3>
                            <button onClick={() => setShowCorrelations(false)} className="text-white hover:text-red-500">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <ul>
                            {Object.entries(regionCorrelation).map(([region, correlation]) => (
                                <li key={region} className="text-white">
                                    {region}: {correlation !== null ? correlation.toFixed(2) : '0.00'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Event Card */}
            {selectedEvent && isEventCardOpen && (
                <EventCard 
                    country={selectedEvent.country} 
                    description={selectedEvent.description} 
                    detailedDescription={selectedEvent.detailedDescription}
                    severityScore={selectedEvent.severityScore}
                    mediaScore={selectedEvent.mediaScore} 
                    onClose={closeEventCard}
                    normalizedDifference={selectedEvent.normalizedDifference}
                    
                />
            )}

            {/* Drawer */}
            {!isDrawerOpen && !isSidebarOpen && !isEventCardOpen &&  ( // Only show the arrow up button when the drawer is closed
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