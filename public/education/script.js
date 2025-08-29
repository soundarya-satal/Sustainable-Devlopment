let villageData = [];
let currentVillage = null;
let educationChart = null;
let districtChart = null;
let pieChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCSVData();
    setupEventListeners();
    setupNavigation();
});

// Load CSV data
function loadCSVData() {
    Papa.parse('andhra_pradesh_villages_education.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => {
            villageData = results.data.filter(v => v.Village_Code);
            populateVillageSelectors();
            populateDistrictSelector();
            console.log(`Loaded ${villageData.length} villages`);
        },
        error: err => {
            console.error('CSV load error:', err);
            alert('Error loading data file. Check if the CSV file is present.');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('village-select').addEventListener('change', e =>
        updateVillageData(e.target.value)
    );

    document.getElementById('compare-btn').addEventListener('click', () =>
        compareVillages(
            document.getElementById('compare-village-1').value,
            document.getElementById('compare-village-2').value
        )
    );

    document.getElementById('district-select').addEventListener('change', e =>
        updateDistrictView(e.target.value)
    );

    document.getElementById('download-report').addEventListener('click', downloadReport);
}

// Navigation handling
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(link.dataset.section).classList.add('active');
        });
    });
}

// Populate selectors
function populateVillageSelectors() {
    const selectors = [
        document.getElementById('village-select'),
        document.getElementById('compare-village-1'),
        document.getElementById('compare-village-2')
    ];

    selectors.forEach(select => (select.innerHTML = '<option value="">-- Select Village --</option>'));

    villageData.forEach(v => {
        const option = document.createElement('option');
        option.value = v.Village_Code;
        option.textContent = `${v.Village_Name} (${v.District})`;
        selectors.forEach(select => select.appendChild(option.cloneNode(true)));
    });
}

function populateDistrictSelector() {
    const districtSelect = document.getElementById('district-select');
    districtSelect.innerHTML = '<option value="">-- All Districts --</option>';

    [...new Set(villageData.map(v => v.District).filter(Boolean))].forEach(d => {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = d;
        districtSelect.appendChild(option);
    });
}

// Village details
function updateVillageData(code) {
    if (!code) return resetDisplay();

    const village = villageData.find(v => v.Village_Code == code);
    if (!village) return;

    currentVillage = village;
    updateScoreDisplay(village);
    updateStatusDisplay(village);
    updateRadarChart(village);
    updatePieChart(village);
    updateMetricsBreakdown(village);
    updateRecommendations(village);
    updateActionPlan(village);
}

function updateScoreDisplay(village) {
    const score = village.Educational_Quality_Percentage || 0;
    const sustainability = village.Village_Sustainability_Index || 0;

    document.getElementById('score-value').textContent = score.toFixed(1);
    document.getElementById('sustainability-value').textContent = sustainability.toFixed(1);

    document.querySelector('.score-circle').style.setProperty('--p', `${score}%`);
    document.querySelector('.score-circle.sustainability').style.setProperty('--p', `${sustainability}%`);
}

function updateStatusDisplay(village) {
    const score = village.Educational_Quality_Percentage || 0;
    const sustainability = village.Village_Sustainability_Index || 0;

    const scoreStatus = document.getElementById('score-status');
    const sustainabilityStatus = document.getElementById('sustainability-status');

    scoreStatus.textContent = getStatusText(score);
    scoreStatus.className = `score-status ${getStatusClass(score)}`;

    sustainabilityStatus.textContent = getStatusText(sustainability);
    sustainabilityStatus.className = `score-status ${getStatusClass(sustainability)}`;
}

function updateRadarChart(village) {
    const ctx = document.getElementById('educationChart').getContext('2d');
    if (educationChart) educationChart.destroy();

    const maxDistance = Math.max(...villageData.map(v => v.School_Distance_km || 0));
    const distanceScore = Math.max(0, 100 - ((village.School_Distance_km || 0) / maxDistance) * 100);

    educationChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['School Proximity', 'Govt Schemes', 'Education Quality', 'Sustainability'],
            datasets: [{
                label: village.Village_Name,
                data: [
                    distanceScore,
                    village.Government_Schemes_Active && village.Government_Schemes_Active !== 'None' ? 100 : 0,
                    village.Educational_Quality_Percentage || 0,
                    village.Village_Sustainability_Index || 0
                ],
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                pointBackgroundColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: { r: { suggestedMin: 0, suggestedMax: 100 } }
        }
    });
}

function updatePieChart(village) {
    // Add a container dynamically if missing
    let pieContainer = document.getElementById('village-pie-container');
    if (!pieContainer) {
        pieContainer = document.createElement('div');
        pieContainer.classList.add('chart-container');
        pieContainer.innerHTML = `<canvas id="villagePieChart"></canvas>`;
        document.getElementById('dashboard').appendChild(pieContainer);
    }

    const ctx = document.getElementById('villagePieChart').getContext('2d');
    if (pieChart) pieChart.destroy();

    const score = village.Educational_Quality_Percentage || 0;

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Quality Achieved', 'Improvement Needed'],
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ['#4caf50', '#f44336']
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function updateMetricsBreakdown(village) {
    const grid = document.getElementById('metrics-grid');
    const maxDistance = Math.max(...villageData.map(v => v.School_Distance_km || 0));
    const distanceScore = Math.max(0, 100 - ((village.School_Distance_km || 0) / maxDistance) * 100);
    const schemeScore = village.Government_Schemes_Active && village.Government_Schemes_Active !== 'None' ? 100 : 0;

    grid.innerHTML = `
        <div class="metric-item"><h3>School Distance</h3><div class="metric-value">${(village.School_Distance_km || 0).toFixed(2)} km</div><span class="metric-status ${getStatusClass(distanceScore)}">${getStatusText(distanceScore)}</span></div>
        <div class="metric-item"><h3>Government Schemes</h3><div class="metric-value">${village.Government_Schemes_Active || 'None'}</div><span class="metric-status ${getStatusClass(schemeScore)}">${getStatusText(schemeScore)}</span></div>
        <div class="metric-item"><h3>Education Quality</h3><div class="metric-value">${(village.Educational_Quality_Percentage || 0).toFixed(1)}%</div><span class="metric-status ${getStatusClass(village.Educational_Quality_Percentage || 0)}">${getStatusText(village.Educational_Quality_Percentage || 0)}</span></div>
        <div class="metric-item"><h3>Sustainability Index</h3><div class="metric-value">${(village.Village_Sustainability_Index || 0).toFixed(1)}</div><span class="metric-status ${getStatusClass(village.Village_Sustainability_Index || 0)}">${getStatusText(village.Village_Sustainability_Index || 0)}</span></div>
    `;
}

// Compare two villages
function compareVillages(code1, code2) {
    const results = document.getElementById('comparison-results');
    if (!code1 || !code2) {
        results.innerHTML = '<p class="placeholder">Select two villages to compare</p>';
        return;
    }

    const v1 = villageData.find(v => v.Village_Code == code1);
    const v2 = villageData.find(v => v.Village_Code == code2);

    if (!v1 || !v2) {
        results.innerHTML = '<p class="placeholder">Invalid village selection</p>';
        return;
    }

    results.innerHTML = `
        <h3>Comparison: ${v1.Village_Name} vs ${v2.Village_Name}</h3>
        <table class="comparison-table">
            <thead>
                <tr><th>Metric</th><th>${v1.Village_Name}</th><th>${v2.Village_Name}</th></tr>
            </thead>
            <tbody>
                <tr><td>School Distance (km)</td><td>${(v1.School_Distance_km || 0).toFixed(2)}</td><td>${(v2.School_Distance_km || 0).toFixed(2)}</td></tr>
                <tr><td>Govt Schemes</td><td>${v1.Government_Schemes_Active || 'None'}</td><td>${v2.Government_Schemes_Active || 'None'}</td></tr>
                <tr><td>Education Quality (%)</td><td>${(v1.Educational_Quality_Percentage || 0).toFixed(1)}</td><td>${(v2.Educational_Quality_Percentage || 0).toFixed(1)}</td></tr>
                <tr><td>Sustainability Index</td><td>${(v1.Village_Sustainability_Index || 0).toFixed(1)}</td><td>${(v2.Village_Sustainability_Index || 0).toFixed(1)}</td></tr>
            </tbody>
        </table>
    `;
}

// District view
function updateDistrictView(district) {
    const ctx = document.getElementById('districtChart').getContext('2d');
    if (!district) {
        if (districtChart) districtChart.destroy();
        return;
    }

    const filtered = villageData.filter(v => v.District === district);
    const labels = filtered.map(v => v.Village_Name);
    const values = filtered.map(v => v.Educational_Quality_Percentage || 0);

    if (districtChart) districtChart.destroy();

    districtChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Education Quality %',
                data: values,
                backgroundColor: 'rgba(25, 118, 210, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// Utility functions
function getStatusClass(score) {
    if (score >= 80) return 'status-good';
    if (score >= 60) return 'status-good';
    if (score >= 40) return 'status-average';
    return 'status-poor';
}

function getStatusText(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
}

function resetDisplay() {
    document.getElementById('score-value').textContent = '--';
    document.getElementById('sustainability-value').textContent = '--';
    document.getElementById('metrics-grid').innerHTML = '';
    if (educationChart) educationChart.destroy();
    if (pieChart) pieChart.destroy();
    document.getElementById('recommendations-content').innerHTML = '<p class="placeholder">Select a village to see improvement recommendations</p>';
    document.getElementById('action-timeline').innerHTML = '<p class="placeholder">Select a village to see the action plan</p>';
}

function downloadReport() {
    alert('Report download feature coming soon!');
}
