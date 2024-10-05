const express = require('express');
const cors = require('cors');
const fs = require('fs');
const {
    initializeData,
    refreshData,
    movePdfsFromTemp,
} = require('./dataHandler');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());

const isTempFolderEmpty = (tempDir) => {
    return fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0;
};

// Route to trigger data refresh
app.post('/api/refresh', async (req, res) => {
    const tempDir = path.join(__dirname, 'tempPDFs');

    if (isTempFolderEmpty(tempDir)) {
        return res.status(400).json({ message: "tempPDFs folder is empty. Please add PDFs before refreshing data." });
    }

    movePdfsFromTemp();
    await refreshData();
    res.status(200).json({ message: "Data refreshed successfully." });
});

// Route to get scraped and ranked event data
app.get('/api/scrape', async (req, res) => {
    const outputFilePath = 'eventsDataRanked.json';
    if (fs.existsSync(outputFilePath)) {
        const existingData = fs.readFileSync(outputFilePath, 'utf-8');
        const parsedData = JSON.parse(existingData);
        return res.json(parsedData);
    } else {
        return res.status(404).json({ error: "Data not found." });
    }
});

//initialize data when the server starts
initializeData();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});