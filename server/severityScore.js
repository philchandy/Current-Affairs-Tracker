//assign a score based on severity and impact
function assignScore(event) {
    let severityScore = 0;
    let impactScore = 0;
  
    const severityKeywords = [
      'violence', 'attacks', 'conflict', 'war', 'unrest', 'protests', 'fighting', 
      'crackdown', 'militants', 'jihadist', 'bandit', 'military', 'rebels'
    ];
    const impactKeywords = [
      'civilian', 'humanitarian', 'displacement', 'crisis', 'crackdown', 
      'economic crisis', 'food crisis', 'refugees'
    ];
  
    // Assign points based on keyword presence in description
    severityKeywords.forEach(keyword => {
      if (event.description.toLowerCase().includes(keyword)) {
        severityScore += 5; 
      }
    });
  
    impactKeywords.forEach(keyword => {
      if (event.description.toLowerCase().includes(keyword)) {
        impactScore += 5;
      }
    });
  
    return { severityScore, impactScore };
}
  
//rank all events by severity and impact
function rankEvents(data) {
    const rankedData = [];

    data.forEach(region => {
      const rankedEvents = region.Events.map(event => {
        const { severityScore, impactScore } = assignScore(event);
        const totalScore = severityScore + impactScore;

        return {
          country: event.country,
          description: event.description,
          severityScore: totalScore
        };
      });

      rankedData.push({
        Region: region.Region,
        Events: rankedEvents.sort((a,b) => b.severityScore - a.severityScore)
      });
    });

    return rankedData;
}

module.exports = rankEvents;
  
// Get the ranked events
// const rankedEvents = rankEvents(eventsData);
  
//Output the ranked events to the console
// console.log('Ranked Events by Severity and Impact:');
// rankedEvents.forEach(event => {
//     console.log(`${event.country} (${event.region}) - Severity: ${event.severityScore}, Impact: ${event.impactScore}, Total Score: ${event.totalScore}`);
// });