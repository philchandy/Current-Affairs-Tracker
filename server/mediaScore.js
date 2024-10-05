const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = "";
const CX = "";

async function getMediaAttentionScore(event){
    const searchQuery = `${event.country} ${event.description}`;
    const searchURL = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(searchQuery)}`;

    let attempts = 0;
    const maxAttempts = 1;


    while (attempts < maxAttempts) {
        try {
            const response = await axios.get(searchURL);
            console.log(`Search Query: ${searchQuery}`); // Log the constructed search query
            console.log(`Search URL: ${searchURL}`);
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

//calculate Pearson correlation coefficient
const calculateCorrelation = (scoresA, scoresB) => {
    if (scoresA.length !== scoresB.length || scoresA.length === 0) return null;

    const n = scoresA.length;
    const meanA = scoresA.reduce((sum, score) => sum + score, 0) / n;
    const meanB = scoresB.reduce((sum, score) => sum + score, 0) / n;

    const covariance = scoresA.reduce((sum, scoreA, i) => sum + (scoreA - meanA) * (scoresB[i] - meanB), 0);
    const stdA = Math.sqrt(scoresA.reduce((sum, scoreA) => sum + Math.pow(scoreA - meanA, 2), 0));
    const stdB = Math.sqrt(scoresB.reduce((sum, scoreB) => sum + Math.pow(scoreB - meanB, 2), 0));

    if (stdA === 0 || stdB === 0) return null; // Avoid division by zero

    return covariance / (stdA * stdB);
};

function calculateNormalizedDifference(severityScore, mediaScore) {
    if (mediaScore === 0) return 0; // Avoid division by zero
    return ((severityScore - mediaScore) / Math.max(severityScore, mediaScore));
}

async function rankEventsByMediaAttention(data) {
    const rankedData = [];
    const rankedFilePath = path.join(__dirname, 'eventsDataRanked.json');

    if (fs.existsSync(rankedFilePath)) {
        const fileStats = fs.statSync(rankedFilePath);
        if (fileStats.size > 0) {
            console.log('eventsDataRanked.json is not empty. Skipping media score calculation.');
            return JSON.parse(fs.readFileSync(rankedFilePath, 'utf8'));
        }
    }

    for (const region of data){
        rankedEvents = [];
        const severityScores = [];
        const mediaScores = [];
        for (const event of region.Events) {
            await delay(2000);

            const mediaAttentionScore = await getMediaAttentionScore(event);
            severityScores.push(event.severityScore);
            mediaScores.push(mediaAttentionScore);

            const normalizedDifference = calculateNormalizedDifference(event.severityScore, mediaAttentionScore);

            rankedEvents.push({
                country: event.country,
                description: event.description,
                detailedDescription: event.detailedDescription,
                severityScore: event.severityScore,
                mediaScore: mediaAttentionScore,
                normalizedDifference: normalizedDifference,
            });
        }

        const correlation = calculateCorrelation(severityScores, mediaScores);

        rankedData.push({
            Region: region.Region,
            Events: rankedEvents,
            Correlation: correlation
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