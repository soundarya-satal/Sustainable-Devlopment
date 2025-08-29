// ==============================
// DOM Elements
// ==============================
const villageSelect = document.getElementById('village-select');
const compareVillage1 = document.getElementById('compare-village-1');
const compareVillage2 = document.getElementById('compare-village-2');
const compareBtn = document.getElementById('compare-btn');
const comparisonResults = document.getElementById('comparison-results');
const scoreDisplay = document.getElementById('score-display');
const scoreValue = document.getElementById('score-value');
const scoreStatus = document.getElementById('score-status');
const metricsGrid = document.getElementById('metrics-grid');
const recommendationsContent = document.getElementById('recommendations-content');
const actionTimeline = document.getElementById('action-timeline');
const downloadReportBtn = document.getElementById('download-report');
const ctx = document.getElementById('electricityChart').getContext('2d');

// Chart instance
let electricityChart;

// Villages data
let villages = [];

// ==============================
// CSV Parsing
// ==============================
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',').map(value => value.trim());
    const entry = {};
    headers.forEach((header, index) => {
      let value = values[index];
      if (header.includes('Percent') || header.includes('Count') || header.includes('Hours') || header === 'Electricity_Access_Percent') {
        value = parseFloat(value) || 0;
      }
      entry[header] = value;
    });
    data.push(entry);
  }
  return data;
}

// ==============================
// Format CSV Data
// ==============================
function formatVillageData(csvData) {
  return csvData.map(village => ({
    id: parseInt(village.Village_Code),
    names: { en: village.Village_Name },
    district: village.District,
    electricityAccess: village.Electricity_Access_Percent,
    metrics: {
      householdAccess: village.Electricity_Access_Percent,
      reliability: calculateReliabilityScore(village),
      renewablePercentage: village.Solar_Power_Implemented === 'Yes' ? 30 : 
                          (village.Solar_Power_Implemented === 'Partial' ? 15 : 5),
      affordability: calculateAffordabilityScore(village),
      infrastructure: calculateInfrastructureScore(village)
    },
    details: {
      streetLighting: village.Street_Lighting_Percent,
      avgHoursSupply: village.Average_Hours_Power_Supply,
      transformerCount: village.Transformer_Count,
      solarPower: village.Solar_Power_Implemented,
      metering: village.Electricity_Metering_Percent,
      outageFrequency: village.Power_Outage_Frequency,
      recentUpgrades: village.Recent_Upgrades,
      lastUpdated: village.Last_Updated,
      dataSource: village.Data_Source,
      verifiedBy: village.Verified_By
    }
  }));
}

// ==============================
// Scoring Functions
// ==============================
function calculateReliabilityScore(village) {
  let score = village.Average_Hours_Power_Supply / 24 * 100;
  if (village.Power_Outage_Frequency === 'High') score *= 0.7;
  else if (village.Power_Outage_Frequency === 'Moderate') score *= 0.85;
  return Math.min(100, Math.round(score));
}

function calculateAffordabilityScore(village) {
  let score = village.Electricity_Metering_Percent;
  if (village.Recent_Upgrades === 'Yes') score += 5;
  return Math.min(100, score);
}

function calculateInfrastructureScore(village) {
  let score = village.Electricity_Access_Percent * 0.6;
  score += Math.min(20, village.Transformer_Count * 5);
  score += village.Street_Lighting_Percent * 0.2;
  return Math.min(100, Math.round(score));
}

// ==============================
// Initialization
// ==============================
document.addEventListener('DOMContentLoaded', function() {
  loadCSVData();
  setupEventListeners();
});

// ==============================
// Load and Populate Data
// ==============================
async function loadCSVData() {
  try {
    const response = await fetch('andhra_pradesh_villages_electricity_500.csv');
    const csvText = await response.text();
    villages = formatVillageData(parseCSV(csvText));
    populateVillageSelectors();
  } catch (error) {
    console.error('Error loading CSV data:', error);
    villages = [];
    populateVillageSelectors();
    alert('Error loading village data. Check if CSV file is available.');
  }
}

function populateVillageSelectors() {
  villageSelect.innerHTML = '<option value="">--Select Village--</option>';
  compareVillage1.innerHTML = '<option value="">--Select Village--</option>';
  compareVillage2.innerHTML = '<option value="">--Select Village--</option>';

  villages.forEach(village => {
    const option = (el) => {
      const opt = document.createElement('option');
      opt.value = village.id;
      opt.textContent = `${village.names.en} (${village.district})`;
      el.appendChild(opt);
    };
    option(villageSelect);
    option(compareVillage1);
    option(compareVillage2);
  });
}

// ==============================
// Event Listeners
// ==============================
function setupEventListeners() {
  villageSelect.addEventListener('change', function () {
    updateVillageData(this.value);
  });

  compareBtn.addEventListener('click', function () {
    compareVillages(compareVillage1.value, compareVillage2.value);
  });

  downloadReportBtn.addEventListener('click', downloadReport);
}

// ==============================
// Update Display
// ==============================
function updateVillageData(villageId) {
  if (!villageId) {
    resetDisplay();
    return;
  }

  const village = villages.find(v => v.id === parseInt(villageId));
  if (!village) return;

  updateScoreDisplay(village.electricityAccess);
  updateStatusDisplay(village.electricityAccess);
  updateChart(village);
  updateMetricsBreakdown(village);
  updateRecommendations(village);
  updateActionPlan(village);
}

function updateScoreDisplay(score) {
  scoreValue.textContent = `${score}%`;
}

function updateStatusDisplay(score) {
  let status = '';
  if (score < 50) status = 'Poor';
  else if (score < 70) status = 'Average';
  else if (score < 85) status = 'Good';
  else status = 'Excellent';
  scoreStatus.textContent = status;
}

function resetDisplay() {
  scoreValue.textContent = '--';
  scoreStatus.textContent = '--';
  metricsGrid.innerHTML = '';
  recommendationsContent.innerHTML = '';
  actionTimeline.innerHTML = '';
  if (electricityChart) electricityChart.destroy();
}

// ==============================
// Chart Update
// ==============================
function updateChart(village) {
  const data = [
    village.metrics.householdAccess,
    village.metrics.reliability,
    village.metrics.renewablePercentage,
    village.metrics.affordability,
    village.metrics.infrastructure
  ];

  const labels = ['Household Access', 'Reliability', 'Renewables', 'Affordability', 'Infrastructure'];

  if (electricityChart) electricityChart.destroy();

  electricityChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: village.names.en,
        data,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: { r: { beginAtZero: true, max: 100 } }
    }
  });
}

// ==============================
// Metrics, Recommendations, Action Plan
// ==============================
function updateMetricsBreakdown(village) {
  metricsGrid.innerHTML = '';
  const metrics = [
    { label: 'Household Access', value: village.metrics.householdAccess },
    { label: 'Reliability', value: village.metrics.reliability },
    { label: 'Renewable Energy', value: village.metrics.renewablePercentage },
    { label: 'Affordability', value: village.metrics.affordability },
    { label: 'Infrastructure', value: village.metrics.infrastructure }
  ];

  metrics.forEach(m => {
    const div = document.createElement('div');
    div.className = 'metric-item';
    div.innerHTML = `
      <div class="metric-header">${m.label}: <strong>${m.value}%</strong></div>
      <div class="metric-bar">
        <div class="metric-bar-fill" style="width:${m.value}%"></div>
      </div>
    `;
    metricsGrid.appendChild(div);
  });
}

function updateRecommendations(village) {
  const recs = generateRecommendations(village);
  recommendationsContent.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
}

function updateActionPlan(village) {
  const plan = generateActionPlan(village);
  actionTimeline.innerHTML = plan.map(p => `
    <div class="timeline-item">
      <div class="timeline-date">${p.timeframe}</div>
      <ul>${p.actions.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>
  `).join('');
}

// ==============================
// Comparison
// ==============================
function compareVillages(v1, v2) {
  if (!v1 || !v2) {
    comparisonResults.textContent = 'Select two villages to compare.';
    return;
  }

  const village1 = villages.find(v => v.id === parseInt(v1));
  const village2 = villages.find(v => v.id === parseInt(v2));

  if (!village1 || !village2) {
    comparisonResults.textContent = 'Invalid village selection.';
    return;
  }

  comparisonResults.innerHTML = `
    <h4>Comparison</h4>
    <p>${village1.names.en} Score: ${village1.electricityAccess}%</p>
    <p>${village2.names.en} Score: ${village2.electricityAccess}%</p>
  `;
}

// ==============================
// Download Report
// ==============================
function downloadReport() {
  const selectedVillage = villageSelect.value;
  if (!selectedVillage) {
    alert('Select a village first.');
    return;
  }
  const village = villages.find(v => v.id === parseInt(selectedVillage));
  const content = `Report for ${village.names.en}\nElectricity Access: ${village.electricityAccess}%`;
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${village.names.en}_report.txt`;
  link.click();
}
function generateRecommendations(village) {
  const recs = [];
  const score = village.electricityAccess;

  if (score < 50) {
    recs.push("Priority: Immediate infrastructure development needed");
    recs.push("Explore public-private partnerships for electrification");
  } else if (score < 70) {
    recs.push("Focus on improving reliability of power supply");
    recs.push("Consider micro-grid solutions for remote areas");
  } else if (score < 85) {
    recs.push("Work on reducing power outage frequency");
    recs.push("Expand renewable energy initiatives");
  } else {
    recs.push("Maintain existing infrastructure with regular audits");
    recs.push("Focus on energy efficiency programs");
  }

  if (village.metrics.reliability < 60)
    recs.push("Improve grid maintenance to reduce outages");

  if (village.metrics.renewablePercentage < 20)
    recs.push("Develop solar power initiatives to increase renewable share");

  if (village.details.transformerCount < 3)
    recs.push("Install additional transformers to improve distribution");

  if (village.details.streetLighting < 50)
    recs.push("Expand street lighting infrastructure for public safety");

  if (village.details.metering < 80)
    recs.push("Implement smart metering to improve billing efficiency");

  return recs;
}

function generateActionPlan(village) {
  const score = village.electricityAccess;

  if (score < 50) {
    return [
      {
        timeframe: "Short-term (0-6 months)",
        actions: [
          "Conduct detailed energy needs assessment",
          "Secure funding for infrastructure projects",
          "Install emergency power supply for critical services"
        ]
      },
      {
        timeframe: "Medium-term (6-18 months)",
        actions: [
          "Extend grid to unserved households",
          "Install transformers in underserved areas",
          "Launch community awareness program"
        ]
      },
      {
        timeframe: "Long-term (18+ months)",
        actions: [
          "Achieve 80% household electrification",
          "Develop local renewable energy sources",
          "Establish maintenance training program"
        ]
      }
    ];
  } else if (score < 70) {
    return [
      {
        timeframe: "Short-term (0-6 months)",
        actions: [
          "Upgrade aging transformers and distribution lines",
          "Implement outage reduction program",
          "Install solar street lights in central areas"
        ]
      },
      {
        timeframe: "Medium-term (6-18 months)",
        actions: [
          "Improve metering infrastructure",
          "Develop solar micro-grids for remote areas",
          "Launch energy efficiency awareness campaign"
        ]
      },
      {
        timeframe: "Long-term (18+ months)",
        actions: [
          "Achieve 24/7 reliable power supply",
          "Increase renewable energy share to 25%",
          "Implement smart grid technology"
        ]
      }
    ];
  } else {
    return [
      {
        timeframe: "Short-term (0-6 months)",
        actions: [
          "Conduct infrastructure audit",
          "Implement preventive maintenance schedule",
          "Launch energy conservation awareness program"
        ]
      },
      {
        timeframe: "Medium-term (6-18 months)",
        actions: [
          "Upgrade to smart meters",
          "Expand solar power generation",
          "Implement demand-side management"
        ]
      },
      {
        timeframe: "Long-term (18+ months)",
        actions: [
          "Achieve 100% renewable energy goal",
          "Implement advanced grid management system",
          "Establish community energy cooperative"
        ]
      }
    ];
  }
}
