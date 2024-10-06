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
    "Nigeria",
    "Niger",
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
    "Somaliland",
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
    "Western Sahara"
];


function isAbbreviation(index, text) {
    return abbreviations.some(abbr => text.slice(index - abbr.length + 1, index + 1) === abbr);
}

//normalize text
function normalizeText(text) {
    return text
        .replace(/^\//, '') 
        .replace(/[\n\r]+/g, ' ')  //newlines to spaces
        .replace(/\s\s+/g, ' ')    //multiple spaces to single space
        .replace(/[^\x20-\x7E]/g, '')  //remove non-ASCII characters
        .trim();
}

//get country and descriptions
function extractCountryAndDetails(dataText) {
    const unknownChars = ['Æ', '', 'È'];  // Special characters marking the country
    const results = [];
    let startIndex = 0;

    while (true) {
        // Find the index of the next unknown character 
        const unknownCharIndex = Math.min(
            ...unknownChars.map(char => dataText.indexOf(char, startIndex)).filter(index => index !== -1)
        );

        if (unknownCharIndex === Infinity) break;

        let periodIndex = unknownCharIndex;
        while (true) {
            periodIndex = dataText.indexOf('. ', periodIndex + 1);
            if (periodIndex === -1 || !isAbbreviation(periodIndex, dataText)) {
                break;
            }
        }

        if (periodIndex !== -1) {
            const descriptionCountry = normalizeText(dataText.slice(unknownCharIndex, periodIndex + 1).trim());

            let nextUnknownCharIndex = Math.min(
                ...unknownChars.map(char => dataText.indexOf(char, periodIndex)).filter(index => index !== -1)
            );

            if (nextUnknownCharIndex === Infinity) nextUnknownCharIndex = dataText.length;
            const detailedDescription = normalizeText(dataText.slice(periodIndex + 1, nextUnknownCharIndex).trim());

            const countryRegex = new RegExp(`^(${countries.join('|')})`, 'i');
            const match = descriptionCountry.match(countryRegex);

            if (match) {
                const country = match[0]; 
                let description = descriptionCountry.replace(country, '').trim(); 

                description = normalizeText(description);

                results.push({
                    country,
                    description,
                    detailedDescription
                });
            }
            startIndex = nextUnknownCharIndex;
        } else {
            break;
        }
    }

    return results;
}

async function parsePdf(filepath) {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer);

    const events = extractCountryAndDetails(data.text);
    return events;
}

async function extractEventsFromPdfs() {
    const finalData = [];
    const files = fs.readdirSync(pdfDirectory);

    for (const file of files) {
        const filepath = path.join(pdfDirectory, file);

        try {
            const eventsWithDetails = await parsePdf(filepath);
            const region = path.basename(file, path.extname(file)); 

            finalData.push({
                Region: region,
                Events: eventsWithDetails
            });
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }

    //data check
    //fs.writeFileSync('eventsData.json', JSON.stringify(finalData, null, 2));

    return finalData;
}

// extractEventsFromPdfs()

module.exports = extractEventsFromPdfs;