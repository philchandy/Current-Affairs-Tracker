const express = require('express');
const cors = require('cors');
const extractEventsFromPdfs = require('./scrape')
const rankEvents = require('./severityScore')
const rankEventsByMediaAttention = require('./mediaScore')
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());

const outputFilePath = 'eventsDataRanked.json'

const initializeData = async () => {
    try {
        const data = await extractEventsFromPdfs(); // Extract events from PDFs
        const rankedSeverity = rankEvents(data); // Rank events by severity
        const rankedEvents = await rankEventsByMediaAttention(rankedSeverity); // Rank events by media attention
        fs.writeFileSync(outputFilePath, JSON.stringify(rankedEvents, null, 2)); // Write to JSON file
        console.log("Data initialized and saved to eventsDataRanked.json");
    } catch (error) {
        console.error("Error initializing data:", error);
    }
}

initializeData();

app.get('/api/scrape', async (req,res) => {
    if (fs.existsSync(outputFilePath)) {
        const existingData = fs.readFileSync(outputFilePath, 'utf-8');
        const parsedData = JSON.parse(existingData);

        // Return the existing ranked events data
        return res.json(parsedData);
    } else {
        return res.status(404).json({ error: "Data not found." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})