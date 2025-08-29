const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Your existing middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', villageRoutes);

// Get all villages
app.get('/api/villages', (req, res) => {
  res.json(villages);
});

// Get a specific village by ID
app.get('/api/villages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const village = villages.find(v => v.id === id);
  
  if (!village) {
    return res.status(404).json({ message: 'Village not found' });
  }
  
  res.json(village);
});

// Get top villages by a specific metric
app.get('/api/top-villages/:metric', (req, res) => {
  const { metric } = req.params;
  const { limit = 3, lang = 'en' } = req.query;
  
  const validMetrics = [
    'waterQuality', 'educationScore', 'healthcareAccess', 'infrastructureScore', 
    'economicIndex', 'environmentalScore', 'digitalLiteracy', 'overallScore'
  ];
  
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({ message: 'Invalid metric' });
  }
  
  const sortedVillages = [...villages]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, parseInt(limit))
    .map(village => ({
      id: village.id,
      name: village.names[lang] || village.names.en,
      score: village[metric],
      status: getStatusCategory(village[metric]),
      population: village.population
    }));
  
  res.json(sortedVillages);
});

// Get villages that need improvement in a specific metric
app.get('/api/needs-improvement/:metric', (req, res) => {
  const { metric } = req.params;
  const { lang = 'en' } = req.query;
  
  const validMetrics = [
    'waterQuality', 'educationScore', 'healthcareAccess', 'infrastructureScore', 
    'economicIndex', 'environmentalScore', 'digitalLiteracy', 'overallScore'
  ];
  
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({ message: 'Invalid metric' });
  }
  
  const needsImprovementVillages = villages
    .filter(village => village[metric] < 70)
    .sort((a, b) => a[metric] - b[metric])
    .map(village => ({
      id: village.id,
      name: village.names[lang] || village.names.en,
      score: village[metric],
      status: getStatusCategory(village[metric]),
      population: village.population
    }));
  
  res.json(needsImprovementVillages);
});

// Compare villages
app.get('/api/compare-villages', (req, res) => {
  const { ids, metrics, lang = 'en' } = req.query;
  
  if (!ids) {
    return res.status(400).json({ message: 'Village IDs are required' });
  }
  
  const villageIds = ids.split(',').map(id => parseInt(id));
  const selectedVillages = villages.filter(v => villageIds.includes(v.id));
  
  if (selectedVillages.length === 0) {
    return res.status(404).json({ message: 'No villages found with the provided IDs' });
  }
  
  let metricsToCompare = [
    'waterQuality', 'educationScore', 'healthcareAccess', 'infrastructureScore', 
    'economicIndex', 'environmentalScore', 'digitalLiteracy', 'overallScore'
  ];
  
  if (metrics) {
    const requestedMetrics = metrics.split(',');
    metricsToCompare = metricsToCompare.filter(m => requestedMetrics.includes(m));
  }
  
  const comparison = selectedVillages.map(village => {
    const result = {
      id: village.id,
      name: village.names[lang] || village.names.en,
      population: village.population
    };
    
    metricsToCompare.forEach(metric => {
      result[metric] = {
        score: village[metric],
        status: getStatusCategory(village[metric])
      };
    });
    
    return result;
  });
  
  res.json(comparison);
});

// Get improvement recommendations for a village
app.get('/api/recommendations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { lang = 'en' } = req.query;
  
  const village = villages.find(v => v.id === id);
  
  if (!village) {
    return res.status(404).json({ message: 'Village not found' });
  }
  
  const scores = {
    waterQuality: village.waterQuality,
    educationScore: village.educationScore,
    healthcareAccess: village.healthcareAccess,
    infrastructureScore: village.infrastructureScore,
    economicIndex: village.economicIndex,
    environmentalScore: village.environmentalScore,
    digitalLiteracy: village.digitalLiteracy
  };
  
  const recommendations = getRecommendations(scores);
  
  const result = {
    id: village.id,
    name: village.names[lang] || village.names.en,
    recommendations: {}
  };
  
  for (const [metric, recs] of Object.entries(recommendations)) {
    result.recommendations[metric] = recs[lang] || recs.en;
  }
  
  res.json(result);
});

// Language translations
const translations = {
  en: {
    waterQuality: "Water Quality",
    education: "Education",
    healthcare: "Healthcare Access",
    infrastructure: "Infrastructure",
    economic: "Economic Index",
    environmental: "Environmental Score",
    digital: "Digital Literacy",
    overall: "Overall Score",
    population: "Population",
    issues: "Issues",
    strengths: "Strengths",
    topVillages: "Top Performing Villages",
    needsAttention: "Villages Needing Attention",
    excellent: "Excellent",
    good: "Good",
    needsImprovement: "Needs Improvement",
    critical: "Critical"
  },
  ml: {
    waterQuality: "ജലത്തിന്റെ ഗുണനിലവാരം",
    education: "വിദ്യാഭ്യാസം",
    healthcare: "ആരോഗ്യസേവന പ്രവേശനം",
    infrastructure: "അടിസ്ഥാന സൗകര്യങ്ങൾ",
    economic: "സാമ്പത്തിക സൂചിക",
    environmental: "പരിസ്ഥിതി സ്കോർ",
    digital: "ഡിജിറ്റൽ സാക്ഷരത",
    overall: "മൊത്തത്തിലുള്ള സ്കോർ",
    population: "ജനസംഖ്യ",
    issues: "പ്രശ്നങ്ങൾ",
    strengths: "ശക്തികൾ",
    topVillages: "മികച്ച പ്രകടനം കാഴ്ചവച്ച ഗ്രാമങ്ങൾ",
    needsAttention: "ശ്രദ്ധ ആവശ്യമുള്ള ഗ്രാമങ്ങൾ",
    excellent: "മികച്ചത്",
    good: "നല്ലത്",
    needsImprovement: "പുരോഗതി ആവശ്യം",
    critical: "ഗുരുതര"
  },
  ta: {
    waterQuality: "நீரின் தரம்",
    education: "கல்வி",
    healthcare: "சுகாதார அணுகல்",
    infrastructure: "அடிப்படை வசதிகள்",
    economic: "பொருளாதார குறியீடு",
    environmental: "சுற்றுச்சூழல் மதிப்பெண்",
    digital: "டிஜிட்டல் கல்வியறிவு",
    overall: "ஒட்டுமொத்த மதிப்பெண்",
    population: "மக்கள்தொகை",
    issues: "பிரச்சினைகள்",
    strengths: "பலங்கள்",
    topVillages: "சிறந்த செயல்திறன் கொண்ட கிராமங்கள்",
    needsAttention: "கவனம் தேவைப்படும் கிராமங்கள்",
    excellent: "சிறந்தது",
    good: "நல்லது",
    needsImprovement: "மேம்பாடு தேவை",
    critical: "முக்கியமானது"
  }
};

// Improvement recommendations based on scores
const getRecommendations = (scores) => {
  const recommendations = {
    waterQuality: {
      low: {
        en: ["Implement water purification systems", "Regular water quality testing", "Rainwater harvesting"],
        ml: ["ജല ശുദ്ധീകരണ സംവിധാനങ്ങൾ നടപ്പിലാക്കുക", "സ്ഥിരമായി ജലത്തിന്റെ ഗുണനിലവാരം പരിശോധിക്കുക", "മഴവെള്ള സംഭരണം"],
        ta: ["நீர் சுத்திகரிப்பு அமைப்புகளை செயல்படுத்துதல்", "வழக்கமான நீர் தர சோதனை", "மழைநீர் சேகரிப்பு"]
      },
      medium: {
        en: ["Upgrade existing water infrastructure", "Community water management training"],
        ml: ["നിലവിലുള്ള ജല അടിസ്ഥാന സൗകര്യങ്ങൾ നവീകരിക്കുക", "സമൂഹ ജല മാനേജ്മെന്റ് പരിശീലനം"],
        ta: ["தற்போதுள்ள நீர் உள்கட்டமைப்பை மேம்படுத்துதல்", "சமூக நீர் மேலாண்மை பயிற்சி"]
      }
    },
    educationScore: {
      low: {
        en: ["Establish community learning centers", "Teacher training programs", "Digital learning resources"],
        ml: ["സമൂഹ പഠന കേന്ദ്രങ്ങൾ സ്ഥാപിക്കുക", "അധ്യാപക പരിശീലന പരിപാടികൾ", "ഡിജിറ്റൽ പഠന വിഭവങ്ങൾ"],
        ta: ["சமூக கற்றல் மையங்களை நிறுவுதல்", "ஆசிரியர் பயிற்சி திட்டங்கள்", "டிஜிட்டல் கற்றல் வளங்கள்"]
      },
      medium: {
        en: ["Enhance school infrastructure", "Scholarship programs for higher education"],
        ml: ["സ്കൂൾ അടിസ്ഥാന സൗകര്യങ്ങൾ മെച്ചപ്പെടുത്തുക", "ഉന്നത വിദ്യാഭ്യാസത്തിനുള്ള സ്കോളർഷിപ്പ് പരിപാടികൾ"],
        ta: ["பள்ளி உள்கட்டமைப்பை மேம்படுத்துதல்", "உயர் கல்விக்கான உதவித்தொகை திட்டங்கள்"]
      }
    },
    healthcareAccess: {
      low: {
        en: ["Mobile health clinics", "Community health worker training", "Telemedicine facilities"],
        ml: ["മൊബൈൽ ആരോഗ്യ ക്ലിനിക്കുകൾ", "കമ്മ്യൂണിറ്റി ഹെൽത്ത് വർക്കർ പരിശീലനം", "ടെലിമെഡിസിൻ സൗകര്യങ്ങൾ"],
        ta: ["மொபைல் சுகாதார மருத்துவமனைகள்", "சமூக சுகாதார பணியாளர் பயிற்சி", "தொலைமருத்துவ வசதிகள்"]
      },
      medium: {
        en: ["Preventive healthcare programs", "Maternal and child health initiatives"],
        ml: ["പ്രതിരോധ ആരോഗ്യ പരിപാടികൾ", "മാതൃ-ശിശു ആരോഗ്യ സംരംഭങ്ങൾ"],
        ta: ["தடுப்பு சுகாதார திட்டங்கள்", "தாய் மற்றும் குழந்தை நல முன்னெடுப்புகள்"]
      }
    },
    infrastructureScore: {
      low: {
        en: ["Road improvement projects", "Public transportation initiatives", "Community center development"],
        ml: ["റോഡ് മെച്ചപ്പെടുത്തൽ പദ്ധതികൾ", "പൊതു ഗതാഗത സംരംഭങ്ങൾ", "കമ്മ്യൂണിറ്റി സെന്റർ വികസനം"],
        ta: ["சாலை மேம்பாட்டு திட்டங்கள்", "பொது போக்குவரத்து முன்னெடுப்புகள்", "சமூக மைய மேம்பாடு"]
      },
      medium: {
        en: ["Energy infrastructure upgrades", "Public space enhancement"],
        ml: ["ഊർജ്ജ അടിസ്ഥാന സൗകര്യ നവീകരണം", "പൊതു ഇടങ്ങളുടെ മെച്ചപ്പെടുത്തൽ"],
        ta: ["ஆற்றல் உள்கட்டமைப்பு மேம்பாடுகள்", "பொது இட மேம்பாடு"]
      }
    },
    economicIndex: {
      low: {
        en: ["Microfinance initiatives", "Vocational training programs", "Agricultural modernization"],
        ml: ["സൂക്ഷ്മ ധനകാര്യ സംരംഭങ്ങൾ", "തൊഴിൽ പരിശീലന പരിപാടികൾ", "കാർഷിക ആധുനികവൽക്കരണം"],
        ta: ["நுண்நிதி முன்னெடுப்புகள்", "தொழில் பயிற்சி திட்டங்கள்", "விவசாய நவீனமயமாக்கல்"]
      },
      medium: {
        en: ["Small business development support", "Market access improvement"],
        ml: ["ചെറുകിട ബിസിനസ് വികസന പിന്തുണ", "വിപണി പ്രവേശന മെച്ചപ്പെടുത്തൽ"],
        ta: ["சிறு வணிக மேம்பாட்டு ஆதரவு", "சந்தை அணுகல் மேம்பாடு"]
      }
    },
    environmentalScore: {
      low: {
        en: ["Reforestation projects", "Waste management systems", "Renewable energy adoption"],
        ml: ["വനവൽക്കരണ പദ്ധതികൾ", "മാലിന്യ നിർവഹണ സംവിധാനങ്ങൾ", "പുനരുപയോഗ ഊർജ്ജ സ്വീകരണം"],
        ta: ["மீண்டும் காடாக்கல் திட்டங்கள்", "கழிவு மேலாண்மை அமைப்புகள்", "புதுப்பிக்கத்தக்க ஆற்றல் ஏற்பு"]
      },
      medium: {
        en: ["Sustainable agriculture practices", "Environmental education programs"],
        ml: ["സുസ്ഥിര കൃഷി രീതികൾ", "പരിസ്ഥിതി വിദ്യാഭ്യാസ പരിപാടികൾ"],
        ta: ["நிலையான விவசாய நடைமுறைகள்", "சுற்றுச்சூழல் கல்வி திட்டங்கள்"]
      }
    },
    digitalLiteracy: {
      low: {
        en: ["Community digital centers", "Basic computer skills training", "Mobile technology workshops"],
        ml: ["കമ്മ്യൂണിറ്റി ഡിജിറ്റൽ സെന്ററുകൾ", "അടിസ്ഥാന കമ്പ്യൂട്ടർ സ്കിൽസ് പരിശീലനം", "മൊബൈൽ സാങ്കേതികവിദ്യ വർക്ക്ഷോപ്പുകൾ"],
        ta: ["சமூக டிஜிட்டல் மையங்கள்", "அடிப்படை கணினி திறன் பயிற்சி", "மொபைல் தொழில்நுட்ப பட்டறைகள்"]
      },
      medium: {
        en: ["Internet connectivity improvement", "Digital entrepreneurship training"],
        ml: ["ഇന്റർനെറ്റ് കണക്റ്റിവിറ്റി മെച്ചപ്പെടുത്തൽ", "ഡിജിറ്റൽ സംരംഭകത്വ പരിശീലനം"],
        ta: ["இணைய இணைப்பு மேம்பாடு", "டிஜிட்டல் தொழில்முனைவோர் பயிற்சி"]
      }
    }
  };
  
  const result = {};
  
  for (const [metric, value] of Object.entries(scores)) {
    if (recommendations[metric]) {
      if (value < 50) {
        result[metric] = recommendations[metric].low;
      } else if (value < 75) {
        result[metric] = recommendations[metric].medium;
      }
    }
  }
  
  return result;
};

// Get status category based on score
const getStatusCategory = (score) => {
  if (score >= 80) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "needsImprovement";
  return "critical";
};

// villages.js
const villages = [
  {
    id: 1,
    names: {
      en: "Green Hills Village",
      ml: "ഗ്രീൻ ഹിൽസ് ഗ്രാമം",
      ta: "பச்சை மலைகள் கிராமம்"
    },
    population: 2500,
    waterQuality: 85,
    educationScore: 78,
    healthcareAccess: 82,
    infrastructureScore: 75,
    economicIndex: 70,
    environmentalScore: 88,
    digitalLiteracy: 65,
    overallScore: 77.6,
    coordinates: { lat: 17.3850, lng: 78.4867 },
    issues: {
      en: ["Digital divide", "Healthcare accessibility"],
      ml: ["ഡിജിറ്റൽ വിഭജനം", "ആരോഗ്യസേവന പ്രവേശനം"],
      ta: ["டிஜிட்டல் பிரிவு", "சுகாதார அணுகல்"]
    },
    strengths: {
      en: ["Clean water", "Environmental conservation"],
      ml: ["ശുദ്ധജലം", "പരിസ്ഥിതി സംരക്ഷണം"],
      ta: ["சுத்தமான நீர்", "சுற்றுச்சூழல் பாதுகாப்பு"]
    },
    lastUpdated: "2025-08-20"
  },
  {
    id: 2,
    names: {
      en: "Sunrise Village",
      ml: "സൺറൈസ് ഗ്രാമം",
      ta: "சூர்யோதய கிராமம்"
    },
    population: 1800,
    waterQuality: 72,
    educationScore: 85,
    healthcareAccess: 79,
    infrastructureScore: 68,
    economicIndex: 73,
    environmentalScore: 80,
    digitalLiteracy: 72,
    overallScore: 75.6,
    coordinates: { lat: 17.4065, lng: 78.4772 },
    issues: {
      en: ["Water contamination", "Road infrastructure"],
      ml: ["ജലമലിനീകരണം", "റോഡ് ഇൻഫ്രാസ്ട്രക്ചർ"],
      ta: ["நீர் மாசுபாடு", "சாலை அமைப்பு"]
    },
    strengths: {
      en: ["Education quality", "Community engagement"],
      ml: ["വിദ്യാഭ്യാസ നിലവാരം", "കമ്യൂണിറ്റി പങ്കാളിത്തം"],
      ta: ["கல்வித் தரம்", "சமூக ஈடுபாடு"]
    },
    lastUpdated: "2025-08-19"
  },
  // ... Continue for Golden Valley (id: 3), Riverside Village (id: 4), Tech Hub Village (id: 5), etc.
];

export default villages;

// businessModel.js
const businessModel = {
  problemSolutionFit: {
    problem: "Rural villages lack comprehensive data analysis and performance tracking systems",
    targetCustomers: ["Government agencies", "NGOs", "Development organizations", "Village councils"],
    criticalNature: "Critical - affects resource allocation and development planning",
    alternatives: ["Manual surveys", "Fragmented government systems", "Basic census data"]
  },
  marketResearch: {
    tam: "₹50,000 crores (Rural development market in India)",
    som: "₹5,000 crores (Digital governance solutions)",
    trends: ["Digital India initiative", "Smart village programs", "Data-driven governance"]
  },
  customerDiscovery: {
    personas: [
      "District Collectors",
      "Village Development Officers",
      "NGO Program Managers",
      "Government Policy Makers"
    ],
    useCases: [
      "Performance monitoring",
      "Resource allocation",
      "Development planning",
      "Impact assessment"
    ],
    willingnessToPay: "High - Government budget allocation available"
  }
};




// API Routes

// Get all villages with language support
app.get('/api/villages/:lang?', (req, res) => {
  const lang = req.params.lang || 'en';
  const localizedVillages = villages.map(village => ({
    ...village,
    name: village.names[lang],
    issues: village.issues[lang],
    strengths: village.strengths[lang]
  }));
  res.json(localizedVillages);
});

// Get top performing villages
app.get('/api/villages/top/:count/:lang?', (req, res) => {
  const count = parseInt(req.params.count) || 3;
  const lang = req.params.lang || 'en';
  
  const sortedVillages = villages
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, count)
    .map(village => ({
      ...village,
      name: village.names[lang],
      issues: village.issues[lang],
      strengths: village.strengths[lang]
    }));
  
  res.json(sortedVillages);
});

// Get villages needing attention
app.get('/api/villages/attention/:lang?', (req, res) => {
  const lang = req.params.lang || 'en';
  const lowPerformingVillages = villages
    .filter(village => village.overallScore < 70)
    .sort((a, b) => a.overallScore - b.overallScore)
    .map(village => ({
      ...village,
      name: village.names[lang],
      issues: village.issues[lang],
      strengths: village.strengths[lang]
    }));
  
  res.json(lowPerformingVillages);
});

// Get specific village details
app.get('/api/village/:id/:lang?', (req, res) => {
  const villageId = parseInt(req.params.id);
  const lang = req.params.lang || 'en';
  const village = villages.find(v => v.id === villageId);
  
  if (!village) {
    return res.status(404).json({ error: 'Village not found' });
  }
  
  const localizedVillage = {
    ...village,
    name: village.names[lang],
    issues: village.issues[lang],
    strengths: village.strengths[lang]
  };
  
  res.json(localizedVillage);
});

// Get analytics data
app.get('/api/analytics/:lang?', (req, res) => {
  const lang = req.params.lang || 'en';
  
  const analytics = {
    totalVillages: villages.length,
    averageScores: {
      waterQuality: Math.round(villages.reduce((sum, v) => sum + v.waterQuality, 0) / villages.length),
      education: Math.round(villages.reduce((sum, v) => sum + v.educationScore, 0) / villages.length),
      healthcare: Math.round(villages.reduce((sum, v) => sum + v.healthcareAccess, 0) / villages.length),
      infrastructure: Math.round(villages.reduce((sum, v) => sum + v.infrastructureScore, 0) / villages.length),
      overall: Math.round(villages.reduce((sum, v) => sum + v.overallScore, 0) / villages.length)
    },
    performanceDistribution: {
      excellent: villages.filter(v => v.overallScore >= 80).length,
      good: villages.filter(v => v.overallScore >= 70 && v.overallScore < 80).length,
      needsImprovement: villages.filter(v => v.overallScore >= 60 && v.overallScore < 70).length,
      critical: villages.filter(v => v.overallScore < 60).length
    }
  };
  
  res.json(analytics);
});

// Get translations
app.get('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang || 'en';
  res.json(translations[lang] || translations.en);
});

// Get business model data
app.get('/api/business-model', (req, res) => {
  res.json(businessModel);
});

// Update village data (for admin use)
app.put('/api/village/:id', (req, res) => {
  const villageId = parseInt(req.params.id);
  const villageIndex = villages.findIndex(v => v.id === villageId);
  
  if (villageIndex === -1) {
    return res.status(404).json({ error: 'Village not found' });
  }
  
  villages[villageIndex] = { ...villages[villageIndex], ...req.body };
  res.json(villages[villageIndex]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Village360 Backend running on port ${PORT}`);
});