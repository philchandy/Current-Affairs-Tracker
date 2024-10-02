const express = require('express');
const cors = require('cors');
const extractEventsFromPdfs = require('./scrape')

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/scrape', async (req,res) => {
    try {
        const data = await extractEventsFromPdfs();
        res.json(data);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})