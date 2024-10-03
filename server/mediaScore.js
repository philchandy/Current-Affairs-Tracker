const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const CX = process.env.SEARCH_ENGINE_ID;

async function getMediaAttentionScore(event){
    const searchQuery = `${event.country} ${event.description}`;
    const searchURL = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(searchQuery)}`;

    let attempts = 0;
    const maxAttempts = 1;


    while (attempts < maxAttempts) {
        try {
            const response = await axios.get(searchURL);
            const totalResults = response.data.searchInformation.totalResults;
    
            //logarithmic scaling
            const mediaScore = Math.min(Math.floor(Math.log10(totalResults + 1) * 20), 100); //cap score at 100 for normalcy
            logSearchQuery(event.country, mediaScore);
            return mediaScore
    
        } catch(error) {
            if (error.response && error.response.status === 429) {
                attempts++;
                const waitTime = Math.pow(2, attempts) * 1000;
                console.warn(`Too many requests. Waiting ${waitTime / 1000} seconds before retrying for ${event.country}...`)
                await delay(waitTime);
            } else {
                console.error(`Error fetching media attention for ${event.country}:`, error)
                return 0;
            }
            
        }
    }
    console.error(`Failed to fetch media attention for ${event.country} after ${maxAttempts} attempts.`);
    return 0; // Return 0 if all attempts fail
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logSearchQuery(country, mediaScore) {
    console.log(`${new Date().toISOString()} - Country: ${country}, Media Score: ${mediaScore}`);
}

async function rankEventsByMediaAttention(data) {
    const rankedData = [];

    for (const region of data){
        rankedEvents = [];
        for (const event of region.Events) {
            await delay(2000);

            const mediaAttentionScore = await getMediaAttentionScore(event);
            rankedEvents.push({
                country: event.country,
                description: event.description,
                severityScore: event.severityScore,
                mediaScore: mediaAttentionScore
            });
        }

        rankedData.push({
            Region: region.Region,
            Events: rankedEvents
        })
    }

    return rankedData;
};

function test() {
    const eventsData = [
        {
            "Region": "Africa",
            "Events": [
                {
                    "country": "Nigeria",
                    "description": "Urban protests against economic and food crisis saw unrest amid looting and security forces crackdown; jihadist, bandit and other armed group violence persisted.",
                    "severityScore": 10
                },
                {
                    "country": "Sudan",
                    "description": "Fighting between Sudanese Army (SAF) and Rapid Support Forces (RSF) escalated in North Darfur, clashes subsided in east amid seasonal rains, and U.S.-led peace talks led to outcomes on aid deliveries amid deteriorating humanitarian crisis.",
                    "severityScore": 10
                }
            ]
        },
        {
            "Region": "Asia",
            "Events": [
                {
                    "country": "Pakistan",
                    "description": "Former PM Imran Khan unsuccessfully attempted to mend relations with military as bilateral tensions with Kabul remained high amid persistent militant attacks.",
                    "severityScore": 10
                },
                {
                    "country": "Thailand",
                    "description": "Court disbanded Move Forward Party (MFP) as new PM Paetongtarn Shinawatra, daughter of former PM Thaksin Shinawatra, took office amid ongoing violence in deep south.",
                    "severityScore": 10
                }
            ]
        }
    ];
    
    
    (async () => {
        try {
            const eventsWithMediaAttention = await rankEventsByMediaAttention(eventsData);
    
           
            console.log("Events with Media Attention Data: ", JSON.stringify(eventsWithMediaAttention, null, 2));
            
            if (!eventsWithMediaAttention) {
                console.error("Error: eventsWithMediaAttention is undefined");
                return;
            }
    
            console.log('Events with Media Attention and Severity Scores:');
            eventsWithMediaAttention.forEach(region => {
                console.log(`Region: ${region.Region}`);
                region.Events.forEach(event => {
                    console.log(JSON.stringify(event, null, 2)); // Output each event with country, description, severityScore, and mediaScore
                });
            });
        } catch (error) {
            console.error("An error occurred while processing events: ", error);
        }
    })();
};

// test()

module.exports = rankEventsByMediaAttention;