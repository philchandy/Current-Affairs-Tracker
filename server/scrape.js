const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfDirectory = path.join(__dirname, 'eventsPDF');

const abbreviations = ['U.S.', 'U.K.', 'Mr.', 'Dr.', 'Prof.', 'etc.'];

const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Democratic Republic of the Congo",
    "Republic of the Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Ivory Coast",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "Somaliland", // De facto state
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
    "Western Sahara" // De facto state
];


function isAbbreviation(index, text){
    for (const abbr of abbreviations) {
        if (text.slice(index - abbr.length + 1, index + 1) === abbr){
            return true;
        }
    }
    return false;
}

function normalizeText(text) {
    return text
        .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
        .replace(/\s\s+/g, ' ')   // Replace multiple spaces with a single space
        .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
        .trim();
}

function extractCountryAndDescription(event) {
    const words = event.split(' ');

    for (let i = 1; i <= Math.min(words.length, 8); i++) {
        const potentialCountry = words.slice(0, i).join(' ');
        if (countries.includes(potentialCountry)) {
            const description = words.slice(i).join(' ');
            return {
                country: potentialCountry,
                description: normalizeText(description)
            };
        }
    }
    return null; // If no country is found, return null
}

// Function to parse a single PDF file
async function parsePdf(filepath) {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer);
    
    const unknownChars = ['Æ', ''];
    let results = [];
    let startIndex = 0;

    while(true){
        const unknownCharIndex = Math.min(
            ...unknownChars
                .map(char => data.text.indexOf(char, startIndex))
                .filter(index => index !== -1)
        );

        if (unknownCharIndex === Infinity) break;

        let periodIndex = unknownCharIndex;

        while (true) {
            periodIndex = data.text.indexOf('. ', periodIndex + 1)

            if (periodIndex === -1 || !isAbbreviation(periodIndex, data.text)){
                break;
            }
        }

        if(periodIndex !== -1){
            const sentence = data.text.slice(unknownCharIndex, periodIndex + 1).trim();
            results.push(normalizeText(sentence));
            startIndex = periodIndex + 1;
        } else {
            break;
        }
    }
    return results;  // Return the raw extracted text
}

// Function to extract events from all PDFs in the 'eventsPDF' folder
async function extractEventsFromPdfs() {
    const finalData = [];
    const files = fs.readdirSync(pdfDirectory);  // Get all PDF files in the folder

    for (const file of files) {
        const filepath = path.join(pdfDirectory, file);

        try {
            const eventsStrings = await parsePdf(filepath)
            const region = path.basename(file, path.extname(file));

            //Added FUnction Below

            const eventsWithCountries = eventsStrings
                .map(extractCountryAndDescription)
                .filter(event => event !== null); // Remove nulls for events without countries

            finalData.push({
                Region: region,
                Events: eventsWithCountries
            });
        } catch (error) {
            console.error(`Error processing ${file}:`, error); 
        }
    }

    fs.writeFileSync('eventsData.json', JSON.stringify(finalData, null, 2));
    return finalData;
}

module.exports = extractEventsFromPdfs;
