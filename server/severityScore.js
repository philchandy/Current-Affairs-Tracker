//assign a score based on severity and impact
function assignScore(event) {
    let severityScore = 0;
    let impactScore = 0;
  
    const severityKeywords = [
      'violence', 'attacks', 'conflict', 'war', 'unrest', 'protests', 'fighting', 
      'crackdown', 'militants', 'jihadist', 'bandit', 'military', 'rebels',
      'uprising', 'insurgency', 'tension', 'escalation', 'skirmish', 'riots', 
      'assassination', 'bombing', 'hostility', 'terrorism', 'sabotage', 'anarchy',
      'extremism', 'secession', 'mutiny', 'faction', 'violence against women',
      'ethnic conflict', 'racial conflict', 'social unrest'
  ];
  
  const impactKeywords = [
      'civilian', 'humanitarian', 'displacement', 'crisis', 'crackdown', 
      'economic crisis', 'food crisis', 'refugees', 'human rights', 'starvation',
      'loss of life', 'casualties', 'migration', 'abuse', 'violations', 
      'trauma', 'vulnerability', 'destitution', 'poverty', 'inequality', 
      'access to services', 'health crisis', 'psychological impact', 
      'children in conflict', 'environmental degradation', 'infrastructure damage'
  ];
  
    // Assign points based on keyword presence in description
    severityKeywords.forEach(keyword => {
      if (event.detailedDescription.toLowerCase().includes(keyword)) {
        severityScore += 5; 
      }
    });
  
    impactKeywords.forEach(keyword => {
      if (event.detailedDescription.toLowerCase().includes(keyword)) {
        impactScore += 5;
      }
    });
  
    // Scale up severity score, for example, multiplying by 2
    const scaledSeverityScore = Math.min(severityScore * 2, 100); // cap at 100

    return { severityScore: scaledSeverityScore, impactScore };
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
          detailedDescription: event.detailedDescription,
          severityScore: totalScore,
        };
      });

      rankedData.push({
        Region: region.Region,
        Events: rankedEvents.sort((a,b) => b.severityScore - a.severityScore)
      });
    });

    return rankedData;
}

function test() {
  const eventsData = [
    {
        "Region": "Europe and Central Asia",
        "Events": [
          {
            "country": "Kosovo",
            "description": "Govt efforts to fully integrate Serb-majority north continued, while President Osmani announced parliamentary elections would take place in February 2025.",
            "detailedDescription": "Pristina took further steps toward fully integrating Serb-majority north. PM Kurti 2 Aug presented govt plan to open central Ibar bridge, which connects Serb- dominated north and Albanian south of Mitrovica city, during briefing to representatives from Quint (U.S., UK, Germany, France, Italy) and EU ambassadors. Days later, hundreds of Kosovo Serbs 7 Aug gathered near bridge to protest plans, citing security concerns. U.S. Ambassador Jeff Hovenier 13 Aug warned move increases the threat [...] for the local community, but also for NATO soldiers. Police 5 Aug closed nine Serbian Post offices amid Pristinas efforts to push out Belgrade- backed institutions and end use of Serbian dinar for cash transactions; EU same day urged govt to reconsider its decision, calling for negotiated solution within EU- facilitated Dialogue. Govt 30 Aug announced closure of five illegal parallel institutions in north, prompting U.S. embassy same day to express disappointment with [govts] continuing uncoordinated actions and said issues related to Serbia- supported structures in Kosovo should be dealt with through the EU-facilitated Dialogue. In another important development. President Osmani 16 Aug announced parliamentary elections for 9 Feb 2025. Caucasus"
          },
          {
            "country": "Armenia",
            "description": "Yerevan and Baku overcame major stumbling block in peace talks, while frontlines remained relatively calm despite occasional incidents.",
            "detailedDescription": "Yerevan and Baku agreed to defer corridor issue amid ongoing peace efforts. Azerbaijans presidential aide Elchin Amirbayov 7 Aug told media outlet RFE/RL that Armenia and Azerbaijan had agreed to remove references to development of transport corridor linking Azerbaijan with its exclave Nakhchivan from draft peace treaty and to refer to it at a later stage; Yerevan next day confirmed announcement. Decision removed key sticking point in talks, and indicated sides could be opting for shorter, simplified statement, rather than the detailed agreement previously envisioned. Moscow appeared to insist on continued discussions about issue, however, given that the 2020 ceasefire deal potentially paved way for major Russian security role along corridor. Notably, Russian FM Sergei Lavrov 19 Aug urged sides to follow the spirit and letter of 2020 agreement, while Azerbaijani President Aliyev and Russian President Putin 28 Aug reportedly exchanged views about opening of the transport corridor. Baku reported several small incidents along frontline. Baku 15, 16, 18 Aug accused Armenian forces of firing at military positions in traditionally calm areas of Nakhchivan, 19 Aug claimed its troops had come under fire along main road leading from Armenia to Azerbaijans Kelbajar district; Baku same day said it had destroyed Armenian quadcopter in Lachin district. Yerevan denied all incidents and 15 Aug restated its June proposal to establish mechanism for investigating alleged ceasefire violations, which outgoing EU Special Representative Toivo Klaar 16 Aug reiterated support for."
          },
          {
            "country": "Azerbaijan",
            "description": "Baku and Yerevan overcame major stumbling block in peace talks, frontlines remained relatively calm despite occasional incidents, and relations with Iran remained fragile.",
            "detailedDescription": "Baku and Yerevan agreed to defer corridor issue amid ongoing peace efforts. Presidential aide Elchin Amirbayov 7 Aug told media outlet RFE/RL that Armenia and Azerbaijan had agreed to remove references to development of transport corridor linking Azerbaijan with its exclave Nakhchivan from draft peace treaty and to refer to it at a later stage; Yerevan next day confirmed announcement. Decision removed key sticking point in talks, and indicated sides could be opting for shorter, simplified statement, rather than the detailed agreement previously envisioned. Moscow appeared to insist on continued discussions about issue, however, given that the 2020 ceasefire deal potentially paved way for major Russian security role along corridor. Notably, Russian FM Sergei Lavrov 19 Aug urged sides to follow the spirit and letter of 2020 agreement, while President Aliyev and Russian President Putin 28 Aug reportedly exchanged views about opening of the transport corridor. Baku reported several small incidents along frontline. Baku 15, 16, 18 Aug accused Armenian forces of firing at military positions in traditionally calm areas of Nakhchivan, 19 Aug claimed its troops had come under fire along main road leading from Armenia to Kelbajar district; Baku same day said it had destroyed Armenian quadcopter in Lachin district. Yerevan denied all incidents and 15 Aug restated its June proposal to establish mechanism for investigating alleged ceasefire violations, which outgoing EU Special Representative Toivo Klaar 16 Aug reiterated support for. Important international developments. Baku 20 Aug applied for BRICS membership after Putins 18-19 Aug state visit. Meanwhile, Russian Security Council Secretary Sergei Shoigu 6 Aug met with Aliyev in capital Baku following trip to Iranian capital Tehran; visit came amid speculation that Iran  which accuses Baku of hosting Israeli military bases  could target Azerbaijan in retaliation for July assassination of Hamas political leader in Tehran, which it blamed on Israel; Russian media portrayed visits as effort to prevent all-out war in Middle East."
          },
          {
            "country": "Georgia",
            "description": "Political parties intensified their election campaigns amid deepening polarisation, and breakaway Abkhazia region appointed veteran diplomat to serve as de facto foreign minister.",
            "detailedDescription": "Election campaigning accelerated amid deepening polarisation. Election campaigning in run-up to Oct parliamentary polls intensified. Ruling Georgian Dream party 13 Aug used anniversary of 2008 war with Russia to accuse largest opposition party and former administration United National Movement of starting war, backed by West, and promised to prosecute its leaders; opposition groups said comments escalated electoral tensions and further endangered Georgias path toward EU integration. Opposition parties and their allied media reported uptick in physical attacks and interference in their regional campaigns; notably, assailant 11 Aug punched leader of opposition alliance Coalition of Change, Nika Melia. Constitutional Court reviewed appeals against foreign agents law. Ministry of Justice 20 Aug appointed personnel responsible for implementing foreign influence law, which 1 Aug came into effect. Meanwhile, Constitutional Court 29-31 Aug held hearings on appeals against law filed by numerous civil society organisations and opposition MPs. Breakaway Abkhazia appointed veteran diplomat as de facto foreign minister. De facto president of breakaway Abkhazia 6 Aug appointed veteran diplomat Sergey Shamba as de facto FM. Shamba has held position twice before and previously called for increased dialogue with Tbilisi, raising hope among some that appointment could lead to more informal contacts. Meanwhile, Shamba 8 Aug announced Russia would not build naval base near Abkhazias Ochamchire town, a proposal floated by de facto president in 2023.  Russia (Internal) Ukraine launched incursion into Kursk region, capturing swath of Russian territory, killing dozens and forcing many thousands of civilians to evacuate; 26 people were freed in major Russia- West prisoner swap. Ukraine launched surprise offensive into Kursk region. Ukraine 6 Aug launched surprise cross-border ground assault, making rapid gains into poorly-defended areas of western Kursk region in largest incursion into Russia since World War II. Ukraines top general Oleksandr Syrskyi 27 Aug claimed forces had captured 1,294 sq km and 100 settlements, including Sudzha town, key Russian gas hub; they also destroyed three bridges over the Seym River and 15 Aug established military commandants office, indicating plans to try and hold on to territory. Russia 23 Aug accused Ukraine of attempts to attack Kursk nuclear power plant; head of UN nuclear watchdog Grossi 27 Aug warned about possibility of a nuclear accident after visiting site. According to Russian officials, well over 130,000 civilians had fled as of 31 Aug while incursion had left 31 dead, though actual toll could be much higher. Offensive began to slow late Aug as Russian units redeployed from other areas, though situation remained dynamic and heavy fighting continued, leaving open the possibility of further escalation along 1,200km-long frontline. Ukraine also attacked neighbouring Bryansk and Belgorod regions, though without much success. Meanwhile, Ukrainian attacks on infrastructure and military facilities escalated; notably, Ukrainian drones 28 Aug struck Kirov region for first time. Peace talks remained elusive. President Putin 12 Aug claimed Ukraine had launched Kursk offensive with the help of its Western masters in attempt to improve its negotiation position, and ruled out negotiations with people who indiscriminately attack civilians. According to 17 Aug report by media outlet The Washington Post, Kyiv and Moscow were planning talks in Qatar on cessation of strikes on energy infrastructure, which latter postponed following incursion. Russia completed largest prisoner exchange with West since Cold War. Russia, U.S. and other Western countries 1 Aug completed high-profile prisoner exchange involving 26 people, including U.S. journalist Evan Gershkovich, Russian opposition politicians and Russian intelligence officers (see Russia/U.S.)."
          },
        ]
    },
  ];
    
  const rankedEvents = rankEvents(eventsData);
    
  console.log('Ranked Events by Severity and Impact:');
  rankedEvents.forEach(region => {
      region.Events.forEach(event => {
          console.log(`${event.country} - Severity: ${event.severityScore}`);
      });
  });
}

module.exports = rankEvents;

