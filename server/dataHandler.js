const fs = require('fs');
const path = require('path');
const extractEventsFromPdfs = require('./scrape');
const rankEvents = require('./severityScore');
const rankEventsByMediaAttention = require('./mediaScore');

const outputFilePath = 'eventsDataRanked.json';
const tempDir = path.join(__dirname, 'tempPDFs');
const eventsPDFDir = path.join(__dirname, 'eventsPDF');

// Initialize data on server startup
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
};

// Wipes the existing data and repopulates it
const refreshData = async () => {
    try {
        console.log("Refreshing data from eventsPDF folder...");

        fs.writeFileSync(outputFilePath, JSON.stringify([], null, 2)); // Reset file
        await initializeData();
        
        console.log("Data refreshed successfully.");
    } catch (error) {
        console.error("Data Already Up to date.", error);
    }
};

// Clear the eventsPDF folder of existing PDFs
const clearEventsPDF = () => {
    if (fs.existsSync(eventsPDFDir)) {
        const existingFiles = fs.readdirSync(eventsPDFDir).filter(file => file.endsWith('.pdf'));
        existingFiles.forEach(file => {
            fs.unlinkSync(path.join(eventsPDFDir, file)); // Remove the file
            console.log(`Removed old PDF: ${file}`);
        });
    } else {
        fs.mkdirSync(eventsPDFDir);
    }
};

// Move PDFs from temp to eventsPDF and clear the temp folder
const movePdfsFromTemp = () => {
    clearEventsPDF();

    if (!fs.existsSync(tempDir)) {
        console.log("Temporary PDF folder does not exist.");
        return;
    }

    const tempFiles = fs.readdirSync(tempDir).filter(file => file.endsWith('.pdf'));

    if (tempFiles.length === 0) {
        console.log("No PDFs found in tempPDFs folder.");
        return;
    }

    console.log(`Found ${tempFiles.length} PDF(s) in tempPDFs folder. Moving to eventsPDF folder...`);

    // Move each PDF file
    tempFiles.forEach(file => {
        const sourcePath = path.join(tempDir, file);
        const destinationPath = path.join(eventsPDFDir, file);
        fs.renameSync(sourcePath, destinationPath);
        console.log(`Moved: ${file}`);
    });

    // Clear the temp folder
    fs.readdirSync(tempDir).forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.unlinkSync(filePath); 
    });
    console.log("Cleared tempPDFs folder.");
};

module.exports = {
    initializeData,
    refreshData,
    movePdfsFromTemp,
};