"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const HeroSection = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {

        async function fetchData() {
            const response = await axios.get('http://localhost:3001/api/scrape');
            const flattenedEvents = response.data.flatMap(region => region.Events);
            setEvents(flattenedEvents);
        }

        fetchData();
    }, []);

    useEffect(() => {
        console.log(events);
    },[events])

    return (
        <div className="App">
            <h1>CrisisWatch Latest Updates</h1>
            <ul>
                {events.map((event, index) => (
                <li key={index}>
                    <h2>{event.country}</h2>
                    <p>{event.description}</p>
                </li>
                ))}
            </ul>
        </div>
    );
}