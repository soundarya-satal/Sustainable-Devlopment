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
const ctx = document.getElementById('sanitationChart')?.getContext('2d');

// Chart instance
let sanitationChart;

// Villages data
let villages = [];

// ==============================
// CSV Parsing
// ==============================
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',').map(v => v.trim());
    const entry = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      if (header.includes('Percent')) value = parseFloat(value) || 0;
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
  return csvData.map(v => ({
    id: parseInt(v.Village_Code) || 0,
    names: { en: v.Village_Name || '' },
    district: v.District || '',
    sanitationAccess: parseFloat(v.Sanitation_Percentage) || 0,
    metrics: {
      toiletAccess: parseFloat(v.Toilet_Access_Percent) || 0,
      wasteCollection: calculateWasteCollectionScore(v.Waste_Collection_Frequency),
      openDefecation: v.Open_Defecation_Status === 'No' ? 100 : 0,
      drainageSystem: calculateDrainageScore(v.Drainage_System)
    },
    details: {
      wasteCollectionFrequency: v.Waste_Collection_Frequency || '',
      openDefecationStatus: v.Open_Defecation_Status || '',
      drainageSystem: v.Drainage_System || '',
      sanitationPercentage: parseFloat(v.Sanitation_Percentage) || 0
    }
  }));
}

// ==============================
// Helper Scoring Functions
// ==============================
function calculateWasteCollectionScore(freq) {
  switch (freq) {
    case 'Daily': return 100;
    case 'Weekly': return 75;
    case 'Monthly': return 50;
    case 'None': return 0;
    default: return 25;
  }
}

function calculateDrainageScore(system) {
  switch (system) {
    case 'Closed': return 100;
    case 'Open': return 60;
    case 'None': return 0;
    default: return 30;
  }
}

// ==============================
// Initialization
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  loadCSVData();
  setupEventListeners();
});

// ==============================
// Load and Populate Data
// ==============================
async function loadCSVData() {
  try {
    const response = await fetch('./andhra_pradesh_villages_sanitation.csv');
    if (!response.ok) throw new Error('CSV file not found');
    const csvText = await response.text();
    villages = formatVillageData(parseCSV(csvText));
    populateVillageSelectors();
  } catch (error) {
    console.error('Error loading CSV:', error);
    villages = [];
    populateVillageSelectors();
    alert('Error loading sanitation data. Make sure CSV file is in the same folder.');
  }
}

function populateVillageSelectors() {
  const selectors = [villageSelect, compareVillage1, compareVillage2];
  selectors.forEach(sel => {
    sel.innerHTML = '<option value="">--Select Village--</option>';
    villages.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.names.en} (${v.district})`;
      sel.appendChild(opt);
    });
  });
}

// ==============================
// Event Listeners
// ==============================
function setupEventListeners() {
  villageSelect.addEventListener('change', () => updateVillageData(villageSelect.value));
  compareBtn.addEventListener('click', () => compareVillages(compareVillage1.value, compareVillage2.value));
  downloadReportBtn.addEventListener('click', downloadReport);
}

// ==============================
// Update Display
// ==============================
function updateVillageData(villageId) {
  if (!villageId) return resetDisplay();
  const village = villages.find(v => v.id === parseInt(villageId));
  if (!village) return;
  updateScoreDisplay(village.sanitationAccess);
  updateStatusDisplay(village.sanitationAccess);
  updateChart(village);
  updateMetricsBreakdown(village);
  updateRecommendations(village);
  updateActionPlan(village);
}

function updateScoreDisplay(score) { scoreValue.textContent = `${score}%`; }

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
  if (sanitationChart) sanitationChart.destroy();
}

// ==============================
// Chart Update
// ==============================
function updateChart(village) {
  if (!ctx) return;
  const data = [
    village.metrics.toiletAccess,
    village.metrics.wasteCollection,
    village.metrics.openDefecation,
    village.metrics.drainageSystem
  ];
  const labels = ['Toilet Access', 'Waste Collection', 'Open Defecation Free', 'Drainage System'];

  if (sanitationChart) sanitationChart.destroy();

  sanitationChart = new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets: [{ label: village.names.en, data, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.2)', pointBackgroundColor: '#28a745' }] },
    options: { scales: { r: { beginAtZero: true, max: 100 } } }
  });
}

// ==============================
// Metrics, Recommendations, Action Plan
// ==============================
function updateMetricsBreakdown(v) {
  metricsGrid.innerHTML = '';
  const metrics = [
    { label: 'Toilet Access', value: v.metrics.toiletAccess },
    { label: 'Waste Collection', value: v.metrics.wasteCollection },
    { label: 'Open Defecation', value: v.metrics.openDefecation },
    { label: 'Drainage System', value: v.metrics.drainageSystem }
  ];
  metrics.forEach(m => {
    const div = document.createElement('div');
    div.className = 'metric-item';
    div.innerHTML = `<div class="metric-header">${m.label}: <strong>${m.value}%</strong></div>
                     <div class="metric-bar"><div class="metric-bar-fill" style="width:${m.value}%"></div></div>`;
    metricsGrid.appendChild(div);
  });
}

function updateRecommendations(v) {
  recommendationsContent.innerHTML = generateRecommendations(v).map(r => `<li>${r}</li>`).join('');
}

function updateActionPlan(v) {
  actionTimeline.innerHTML = generateActionPlan(v).map(p => `
    <div class="timeline-item">
      <div class="timeline-date">${p.timeframe}</div>
      <ul>${p.actions.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>`).join('');
}

// ==============================
// Recommendations & Action Plan
// ==============================
function generateRecommendations(v) {
  const recs = [];
  const score = v.sanitationAccess;
  if (score < 50) recs.push("Immediate sanitation upgrades", "Launch community-led programs");
  else if (score < 70) recs.push("Improve household toilet access", "Increase waste collection frequency");
  else if (score < 85) recs.push("Eliminate open defecation", "Upgrade drainage systems");
  else recs.push("Maintain infrastructure", "Expand hygiene education");

  if (v.metrics.toiletAccess < 70) recs.push("Subsidize toilet construction for low-income families");
  if (v.metrics.wasteCollection < 50) recs.push("Enhance waste collection services");
  if (v.metrics.openDefecation < 100) recs.push("Awareness programs to eliminate open defecation");
  if (v.metrics.drainageSystem < 60) recs.push("Improve drainage to prevent contamination");

  return recs;
}

function generateActionPlan(v) {
  const score = v.sanitationAccess;
  if (score < 50) return [
    { timeframe: "Short-term (0-6 months)", actions: ["Sanitation needs assessment", "Awareness programs", "Public toilet construction"] },
    { timeframe: "Medium-term (6-18 months)", actions: ["Household toilet program", "Regular waste collection", "Open defecation eradication"] },
    { timeframe: "Long-term (18+ months)", actions: ["Achieve 100% toilet coverage", "Develop drainage systems", "Sustainable waste management"] }
  ];
  if (score < 70) return [
    { timeframe: "Short-term (0-6 months)", actions: ["Identify underserved households", "Improve collection frequency", "Repair facilities"] },
    { timeframe: "Medium-term (6-18 months)", actions: ["Expand toilet coverage", "Upgrade drainage systems", "Community monitoring"] },
    { timeframe: "Long-term (18+ months)", actions: ["Achieve open defecation free status", "Ensure sustainability", "Solid waste management"] }
  ];
  return [
    { timeframe: "Short-term (0-6 months)", actions: ["Audit sanitation systems", "Preventive maintenance", "School hygiene programs"] },
    { timeframe: "Medium-term (6-18 months)", actions: ["Upgrade facilities", "Implement recycling programs", "Community sanitation tracking"] },
    { timeframe: "Long-term (18+ months)", actions: ["100% sustainable coverage", "Advanced wastewater treatment", "Model sanitation village program"] }
  ];
}

// ==============================
// Comparison
// ==============================
function compareVillages(id1, id2) {
  if (!id1 || !id2) { comparisonResults.textContent = 'Select two villages to compare.'; return; }
  const v1 = villages.find(v => v.id === parseInt(id1));
  const v2 = villages.find(v => v.id === parseInt(id2));
  if (!v1 || !v2) { comparisonResults.textContent = 'Invalid village selection.'; return; }

  comparisonResults.innerHTML = `<h4>Comparison</h4>
                                 <p>${v1.names.en} Score: ${v1.sanitationAccess}%</p>
                                 <p>${v2.names.en} Score: ${v2.sanitationAccess}%</p>`;
}

// ==============================
// Download Report
// ==============================
function downloadReport() {
  const selectedVillage = villageSelect.value;
  if (!selectedVillage) { alert('Select a village first.'); return; }
  const v = villages.find(v => v.id === parseInt(selectedVillage));
  const content = `Report for ${v.names.en}\nSanitation Access: ${v.sanitationAccess}%`;
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${v.names.en}_sanitation_report.txt`;
  link.click();
}
