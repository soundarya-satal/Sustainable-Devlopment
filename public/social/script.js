// ==============================
// Global variables
// ==============================
let villageData = [];
let currentVillage = null;
let metricsChart = null;

// ==============================
// DOM Content Loaded
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    loadCSVData();
    setupEventListeners();
});

// ==============================
// Load CSV data using PapaParse
// ==============================
function loadCSVData() {
    Papa.parse('andhra_pradesh_villages_social.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (!results || !results.data || results.data.length === 0) {
                alert('CSV loaded but no data found. Check headers and format.');
                console.error('CSV data empty or invalid:', results);
                return;
            }

            // Filter out invalid rows
            villageData = results.data.filter(v => v.Village_Code && v.Village_Name);
            if (villageData.length === 0) {
                alert('No valid village entries found in CSV.');
                return;
            }

            populateVillageSelectors();
            console.log('CSV data loaded successfully:', villageData.length, 'villages');
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            alert('Error loading village data. Ensure CSV is in correct path and served via a local server.');
        }
    });
}

// ==============================
// Setup event listeners
// ==============================
function setupEventListeners() {
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');
    const compareBtn = document.getElementById('compare-btn');
    const downloadReportBtn = document.getElementById('download-report');

    villageSelect.addEventListener('change', () => updateVillageData(villageSelect.value));
    compareBtn.addEventListener('click', () => compareVillages(compareVillage1.value, compareVillage2.value));
    downloadReportBtn.addEventListener('click', downloadReport);
}

// ==============================
// Populate village selectors
// ==============================
function populateVillageSelectors() {
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');

    villageSelect.innerHTML = '<option value="">--Select Village--</option>';
    compareVillage1.innerHTML = '<option value="">--Select Village--</option>';
    compareVillage2.innerHTML = '<option value="">--Select Village--</option>';

    villageData.forEach(village => {
        const option = document.createElement('option');
        option.value = village.Village_Code;
        option.textContent = `${village.Village_Name} (${village.District || 'N/A'})`;

        villageSelect.appendChild(option.cloneNode(true));
        compareVillage1.appendChild(option.cloneNode(true));
        compareVillage2.appendChild(option);
    });
}

// ==============================
// Update village data display
// ==============================
function updateVillageData(villageCode) {
    if (!villageCode) {
        resetDisplay();
        return;
    }

    const village = villageData.find(v => v.Village_Code == villageCode);
    if (!village) return;

    currentVillage = village;

    updateScoreDisplay(village);
    updateStatusDisplay(village);
    updateChart(village);
    updateMetricsBreakdown(village);
    updateRecommendations(village);
}

// ==============================
// Score display
// ==============================
function updateScoreDisplay(village) {
    const scoreValue = document.getElementById('score-value');
    const score = village.Village_Sustainability_Index || 0;
    scoreValue.textContent = `${score}`;

    const scoreCircle = document.querySelector('.score-circle');
    if (scoreCircle) {
        scoreCircle.style.setProperty('--p', `${score}`);
        scoreCircle.style.setProperty('--c', getScoreColor(score));
    }
}

function getScoreColor(score) {
    if (score >= 80) return 'var(--good-status)';
    if (score >= 60) return 'var(--average-status)';
    return 'var(--poor-status)';
}

// ==============================
// Status display
// ==============================
function updateStatusDisplay(village) {
    const scoreStatus = document.getElementById('score-status');
    const score = village.Village_Sustainability_Index || 0;

    let status = '';
    let statusClass = '';

    if (score >= 80) {
        status = 'Excellent';
        statusClass = 'good';
    } else if (score >= 60) {
        status = 'Good';
        statusClass = 'good';
    } else if (score >= 40) {
        status = 'Average';
        statusClass = 'average';
    } else {
        status = 'Poor';
        statusClass = 'poor';
    }

    scoreStatus.textContent = status;
    scoreStatus.className = `score-status ${statusClass}`;
}

// ==============================
// Chart display
// ==============================
function updateChart(village) {
    const ctx = document.getElementById('metricsChart')?.getContext('2d');
    if (!ctx) return;

    if (metricsChart) metricsChart.destroy();

    const metrics = getChartMetrics(village);

    metricsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: metrics.labels,
            datasets: [{
                label: village.Village_Name,
                data: metrics.values,
                backgroundColor: metrics.colors,
                borderColor: metrics.colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Score (%)' }
                }
            }
        }
    });
}

function getChartMetrics(village) {
    return {
        labels: ['Education', 'Health', 'Infrastructure', 'Employment', 'Social'],
        values: [
            village.Education_Score || 0,
            village.Health_Score || 0,
            village.Infrastructure_Score || 0,
            village.Employment_Rate || 0,
            village.Social_Score || 0
        ],
        colors: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(153, 102, 255, 0.6)'
        ]
    };
}

// ==============================
// Metrics breakdown
// ==============================
function updateMetricsBreakdown(village) {
    const metricsGrid = document.getElementById('metrics-grid');
    if (!metricsGrid) return;

    const metrics = [
        { title: 'Education Score', value: village.Education_Score || 0 },
        { title: 'Health Score', value: village.Health_Score || 0 },
        { title: 'Infrastructure Score', value: village.Infrastructure_Score || 0 },
        { title: 'Employment Rate', value: `${village.Employment_Rate || 0}%` }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
        <div class="metric-item">
            <h3>${metric.title}</h3>
            <div class="metric-value">${metric.value}</div>
            <span class="metric-status ${getStatusClass(metric.value)}">${getStatusText(metric.value)}</span>
        </div>
    `).join('');
}

function getStatusClass(score) {
    score = Number(score);
    if (score >= 80) return 'status-good';
    if (score >= 60) return 'status-good';
    if (score >= 40) return 'status-average';
    return 'status-poor';
}

function getStatusText(score) {
    score = Number(score);
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
}

// ==============================
// Recommendations
// ==============================
function updateRecommendations(village) {
    const recommendationsContent = document.getElementById('recommendations-content');
    if (!recommendationsContent) return;

    const recommendations = generateRecommendations(village);

    recommendationsContent.innerHTML = `
        <ul class="recommendation-list">
            ${recommendations.map(rec => `<li><i class="fas fa-lightbulb"></i> ${rec}</li>`).join('')}
        </ul>
    `;
}

function generateRecommendations(village) {
    const recommendations = [];
    const score = village.Village_Sustainability_Index || 0;

    if (score < 40) {
        recommendations.push("Develop comprehensive social development plan");
        recommendations.push("Seek government support programs for rural development");
        recommendations.push("Improve basic infrastructure facilities");
    } else if (score < 60) {
        recommendations.push("Enhance educational facilities and programs");
        recommendations.push("Improve healthcare accessibility");
        recommendations.push("Develop employment generation schemes");
    } else if (score < 80) {
        recommendations.push("Strengthen community participation programs");
        recommendations.push("Upgrade digital connectivity and access");
        recommendations.push("Promote local entrepreneurship");
    } else {
        recommendations.push("Maintain current development initiatives");
        recommendations.push("Share best practices with neighboring villages");
        recommendations.push("Focus on sustainable long-term development");
    }

    if ((village.Education_Score || 0) < 50) recommendations.push("Improve school infrastructure and teacher availability");
    if ((village.Health_Score || 0) < 50) recommendations.push("Enhance healthcare facilities and regular medical camps");
    if ((village.Infrastructure_Score || 0) < 50) recommendations.push("Prioritize road connectivity and electricity access");

    return recommendations;
}

// ==============================
// Compare villages
// ==============================
function compareVillages(villageCode1, villageCode2) {
    const comparisonResults = document.getElementById('comparison-results');
    if (!comparisonResults) return;

    if (!villageCode1 || !villageCode2) {
        comparisonResults.innerHTML = '<p class="placeholder">Please select two villages to compare</p>';
        return;
    }

    const village1 = villageData.find(v => v.Village_Code == villageCode1);
    const village2 = villageData.find(v => v.Village_Code == villageCode2);

    if (!village1 || !village2) {
        comparisonResults.innerHTML = '<p class="placeholder">Invalid village selection</p>';
        return;
    }

    comparisonResults.innerHTML = `
        <h3>Comparison: ${village1.Village_Name} vs ${village2.Village_Name}</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>${village1.Village_Name}</th>
                    <th>${village2.Village_Name}</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Sustainability Index</td><td>${village1.Village_Sustainability_Index || 0}</td><td>${village2.Village_Sustainability_Index || 0}</td></tr>
                <tr><td>Education Score</td><td>${village1.Education_Score || 0}</td><td>${village2.Education_Score || 0}</td></tr>
                <tr><td>Health Score</td><td>${village1.Health_Score || 0}</td><td>${village2.Health_Score || 0}</td></tr>
                <tr><td>Infrastructure Score</td><td>${village1.Infrastructure_Score || 0}</td><td>${village2.Infrastructure_Score || 0}</td></tr>
                <tr><td>Employment Rate</td><td>${village1.Employment_Rate || 0}%</td><td>${village2.Employment_Rate || 0}%</td></tr>
                <tr><td>Population</td><td>${village1.Population || 'N/A'}</td><td>${village2.Population || 'N/A'}</td></tr>
            </tbody>
        </table>
    `;
}

// ==============================
// Download report
// ==============================
function downloadReport() {
    if (!currentVillage) {
        alert('Please select a village first');
        return;
    }

    const reportContent = generateReportContent(currentVillage);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVillage.Village_Name}_Social_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReportContent(village) {
    return `
VILLAGE SOCIAL REPORT
=====================

Village: ${village.Village_Name}
District: ${village.District || 'N/A'}
Report Date: ${new Date().toLocaleDateString()}

SUMMARY
--------
Sustainability Index: ${village.Village_Sustainability_Index || 0}
Overall Status: ${getStatusText(village.Village_Sustainability_Index || 0)}

DETAILED METRICS
----------------
1. Education Score: ${village.Education_Score || 0}
2. Health Score: ${village.Health_Score || 0}
3. Infrastructure Score: ${village.Infrastructure_Score || 0}
4. Employment Rate: ${village.Employment_Rate || 0}%
5. Population: ${village.Population || 'N/A'}

RECOMMENDATIONS
---------------
${generateRecommendations(village).map((rec, i) => `${i+1}. ${rec}`).join('\n')}

NOTES
-----
This report is generated based on available data. Regular monitoring and community participation are essential for social development.
`;
}

// ==============================
// Reset display
// ==============================
function resetDisplay() {
    document.getElementById('score-value').textContent = '--';
    const scoreStatus = document.getElementById('score-status');
    scoreStatus.textContent = 'Select a village to see social metrics';
    scoreStatus.className = 'score-status';

    document.getElementById('metrics-grid').innerHTML = '';
    document.getElementById('recommendations-content').innerHTML = '<p class="placeholder">Select a village to see improvement recommendations</p>';
    document.getElementById('comparison-results').innerHTML = '<p class="placeholder">Select two villages to compare their social metrics</p>';

    if (metricsChart) {
        metricsChart.destroy();
        metricsChart = null;
    }

    currentVillage = null;
}
