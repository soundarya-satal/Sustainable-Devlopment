// waste-management.js

// Global variables
let villageData = [];
let currentVillage = null;
let wasteChart = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

// Load CSV data
function loadCSVData() {
    // Use PapaParse to load the CSV file
    Papa.parse('andhra_pradesh_villages_waste_management.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            villageData = results.data;
            populateVillageSelectors();
            console.log('CSV data loaded successfully:', villageData.length, 'villages');
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            alert('Error loading village data. Please check if the CSV file is available.');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');
    const compareBtn = document.getElementById('compare-btn');
    const downloadReportBtn = document.getElementById('download-report');

    villageSelect.addEventListener('change', function() {
        updateVillageData(this.value);
    });

    compareBtn.addEventListener('click', function() {
        compareVillages(compareVillage1.value, compareVillage2.value);
    });

    downloadReportBtn.addEventListener('click', downloadReport);
}

// Populate village selectors
function populateVillageSelectors() {
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');

    // Clear existing options
    villageSelect.innerHTML = '<option value="">--Select Village--</option>';
    compareVillage1.innerHTML = '<option value="">--Select Village--</option>';
    compareVillage2.innerHTML = '<option value="">--Select Village--</option>';

    // Add villages to selectors
    villageData.forEach(village => {
        if (village.Village_Code && village.Village_Name) {
            const option = document.createElement('option');
            option.value = village.Village_Code;
            option.textContent = `${village.Village_Name} (${village.District})`;
            
            villageSelect.appendChild(option.cloneNode(true));
            compareVillage1.appendChild(option.cloneNode(true));
            compareVillage2.appendChild(option);
        }
    });
}

// Update village data display
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
    updateActionPlan(village);
}

// Update score display
function updateScoreDisplay(village) {
    const scoreValue = document.getElementById('score-value');
    const score = village.Village_Sustainability_Index || 0;
    scoreValue.textContent = `${score}`;
    
    // Update the score circle
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--p', `${score}%`);
}

// Update status display
function updateStatusDisplay(village) {
    const scoreStatus = document.getElementById('score-status');
    const score = village.Village_Sustainability_Index || 0;
    
    let status, statusClass;
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

// Update chart
function updateChart(village) {
    const ctx = document.getElementById('wasteChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (wasteChart) {
        wasteChart.destroy();
    }
    
    // Calculate metrics for the chart
    const collectionScore = calculateCollectionScore(village.Waste_Collection_Frequency);
    const sanitationScore = calculateSanitationScore(village.Open_Defecation_Status);
    const drainageScore = calculateDrainageScore(village.Drainage_System);
    const sustainabilityScore = village.Village_Sustainability_Index || 0;
    
    wasteChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Waste Collection', 'Sanitation', 'Drainage System', 'Sustainability'],
            datasets: [{
                label: village.Village_Name,
                data: [collectionScore, sanitationScore, drainageScore, sustainabilityScore],
                backgroundColor: 'rgba(46, 125, 50, 0.2)',
                borderColor: 'rgba(46, 125, 50, 1)',
                pointBackgroundColor: 'rgba(46, 125, 50, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(46, 125, 50, 1)'
            }]
        },
        options: {
            elements: {
                line: {
                    tension: 0.2
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// Calculate collection score based on frequency
function calculateCollectionScore(frequency) {
    switch(frequency) {
        case 'Daily': return 100;
        case 'Weekly': return 75;
        case 'Monthly': return 50;
        case 'None': return 0;
        default: return 25;
    }
}

// Calculate sanitation score
function calculateSanitationScore(status) {
    return status === 'No' ? 100 : 0;
}

// Calculate drainage score
function calculateDrainageScore(system) {
    switch(system) {
        case 'Closed': return 100;
        case 'Open': return 50;
        case 'None': return 0;
        default: return 25;
    }
}

// Update metrics breakdown
function updateMetricsBreakdown(village) {
    const metricsGrid = document.getElementById('metrics-grid');
    
    const collectionScore = calculateCollectionScore(village.Waste_Collection_Frequency);
    const sanitationScore = calculateSanitationScore(village.Open_Defecation_Status);
    const drainageScore = calculateDrainageScore(village.Drainage_System);
    
    metricsGrid.innerHTML = `
        <div class="metric-item">
            <h3>Waste Collection Frequency</h3>
            <div class="metric-value">${village.Waste_Collection_Frequency || 'None'}</div>
            <span class="metric-status ${getStatusClass(collectionScore)}">${getStatusText(collectionScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Open Defecation Status</h3>
            <div class="metric-value">${village.Open_Defecation_Status === 'No' ? 'No Open Defecation' : 'Open Defecation Present'}</div>
            <span class="metric-status ${getStatusClass(sanitationScore)}">${getStatusText(sanitationScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Drainage System</h3>
            <div class="metric-value">${village.Drainage_System || 'None'}</div>
            <span class="metric-status ${getStatusClass(drainageScore)}">${getStatusText(drainageScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Sustainability Index</h3>
            <div class="metric-value">${village.Village_Sustainability_Index || 0}</div>
            <span class="metric-status ${getStatusClass(village.Village_Sustainability_Index || 0)}">${getStatusText(village.Village_Sustainability_Index || 0)}</span>
        </div>
    `;
}

// Get status class based on score
function getStatusClass(score) {
    if (score >= 80) return 'status-good';
    if (score >= 60) return 'status-good';
    if (score >= 40) return 'status-average';
    return 'status-poor';
}

// Get status text based on score
function getStatusText(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
}

// Update recommendations
function updateRecommendations(village) {
    const recommendationsContent = document.getElementById('recommendations-content');
    const recommendations = generateRecommendations(village);
    
    recommendationsContent.innerHTML = `
        <ul class="recommendation-list">
            ${recommendations.map(rec => `<li><i class="fas fa-lightbulb"></i> ${rec}</li>`).join('')}
        </ul>
    `;
}

// Generate recommendations based on village data
function generateRecommendations(village) {
    const recommendations = [];
    const collectionScore = calculateCollectionScore(village.Waste_Collection_Frequency);
    const sanitationScore = calculateSanitationScore(village.Open_Defecation_Status);
    const drainageScore = calculateDrainageScore(village.Drainage_System);
    
    if (collectionScore < 60) {
        recommendations.push("Improve waste collection frequency to at least weekly");
    }
    
    if (sanitationScore === 0) {
        recommendations.push("Implement programs to eliminate open defecation");
        recommendations.push("Build more public toilets with proper maintenance");
    }
    
    if (drainageScore < 50) {
        recommendations.push("Upgrade drainage system to prevent water logging");
    }
    
    if ((village.Village_Sustainability_Index || 0) < 50) {
        recommendations.push("Develop a comprehensive waste management plan");
        recommendations.push("Implement community awareness programs on waste segregation");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Maintain current waste management practices");
        recommendations.push("Consider implementing composting and recycling programs");
    }
    
    return recommendations;
}

// Update action plan
function updateActionPlan(village) {
    const actionTimeline = document.getElementById('action-timeline');
    const actionPlan = generateActionPlan(village);
    
    actionTimeline.innerHTML = `
        ${actionPlan.map((item, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                <div class="timeline-content">
                    <div class="timeline-date">${item.timeframe}</div>
                    <ul>
                        ${item.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('')}
    `;
}

// Generate action plan based on village data
function generateActionPlan(village) {
    const collectionScore = calculateCollectionScore(village.Waste_Collection_Frequency);
    const sanitationScore = calculateSanitationScore(village.Open_Defecation_Status);
    const drainageScore = calculateDrainageScore(village.Drainage_System);
    const sustainabilityScore = village.Village_Sustainability_Index || 0;
    
    if (sustainabilityScore < 40) {
        return [
            {
                timeframe: "Immediate (0-1 month)",
                actions: [
                    "Conduct waste audit to identify key issues",
                    "Set up temporary waste collection points",
                    "Launch awareness campaign on proper waste disposal"
                ]
            },
            {
                timeframe: "Short-term (1-3 months)",
                actions: [
                    "Implement weekly waste collection schedule",
                    "Install public trash bins in key locations",
                    "Start community clean-up drives"
                ]
            },
            {
                timeframe: "Medium-term (3-6 months)",
                actions: [
                    "Build proper drainage system",
                    "Construct public toilets to eliminate open defecation",
                    "Implement waste segregation at source"
                ]
            },
            {
                timeframe: "Long-term (6+ months)",
                actions: [
                    "Establish recycling and composting facilities",
                    "Develop sustainable waste management policy",
                    "Create green spaces from reclaimed areas"
                ]
            }
        ];
    } else if (sustainabilityScore < 70) {
        return [
            {
                timeframe: "Short-term (1-2 months)",
                actions: [
                    "Improve waste collection frequency",
                    "Enhance drainage system maintenance",
                    "Expand public toilet facilities"
                ]
            },
            {
                timeframe: "Medium-term (2-4 months)",
                actions: [
                    "Implement door-to-door waste collection",
                    "Start community composting program",
                    "Install more waste segregation bins"
                ]
            },
            {
                timeframe: "Long-term (4+ months)",
                actions: [
                    "Develop material recovery facility",
                    "Implement pay-as-you-throw system",
                    "Create green jobs in waste management"
                ]
            }
        ];
    } else {
        return [
            {
                timeframe: "Ongoing",
                actions: [
                    "Maintain current waste management systems",
                    "Continue community education programs",
                    "Regular monitoring and evaluation"
                ]
            },
            {
                timeframe: "Improvement",
                actions: [
                    "Explore advanced waste-to-energy technologies",
                    "Implement smart waste management systems",
                    "Achieve zero waste to landfill target"
                ]
            }
        ];
    }
}

// Compare villages
function compareVillages(villageCode1, villageCode2) {
    const comparisonResults = document.getElementById('comparison-results');
    
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
    
    const collectionScore1 = calculateCollectionScore(village1.Waste_Collection_Frequency);
    const collectionScore2 = calculateCollectionScore(village2.Waste_Collection_Frequency);
    
    const sanitationScore1 = calculateSanitationScore(village1.Open_Defecation_Status);
    const sanitationScore2 = calculateSanitationScore(village2.Open_Defecation_Status);
    
    const drainageScore1 = calculateDrainageScore(village1.Drainage_System);
    const drainageScore2 = calculateDrainageScore(village2.Drainage_System);
    
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
                <tr>
                    <td>Waste Collection</td>
                    <td>${village1.Waste_Collection_Frequency || 'None'} (${collectionScore1}%)</td>
                    <td>${village2.Waste_Collection_Frequency || 'None'} (${collectionScore2}%)</td>
                </tr>
                <tr>
                    <td>Open Defecation</td>
                    <td>${village1.Open_Defecation_Status} (${sanitationScore1}%)</td>
                    <td>${village2.Open_Defecation_Status} (${sanitationScore2}%)</td>
                </tr>
                <tr>
                    <td>Drainage System</td>
                    <td>${village1.Drainage_System || 'None'} (${drainageScore1}%)</td>
                    <td>${village2.Drainage_System || 'None'} (${drainageScore2}%)</td>
                </tr>
                <tr>
                    <td>Sustainability Index</td>
                    <td>${village1.Village_Sustainability_Index || 0}</td>
                    <td>${village2.Village_Sustainability_Index || 0}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Download report
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
    a.download = `${currentVillage.Village_Name}_Waste_Management_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate report content
function generateReportContent(village) {
    const collectionScore = calculateCollectionScore(village.Waste_Collection_Frequency);
    const sanitationScore = calculateSanitationScore(village.Open_Defecation_Status);
    const drainageScore = calculateDrainageScore(village.Drainage_System);
    
    return `
WASTE MANAGEMENT REPORT
=======================

Village: ${village.Village_Name}
District: ${village.District}
Report Date: ${new Date().toLocaleDateString()}

SUMMARY
--------
Sustainability Index: ${village.Village_Sustainability_Index || 0}
Overall Status: ${getStatusText(village.Village_Sustainability_Index || 0)}

DETAILED METRICS
----------------
1. Waste Collection Frequency: ${village.Waste_Collection_Frequency || 'None'} (Score: ${collectionScore}%)
2. Open Defecation Status: ${village.Open_Defecation_Status} (Score: ${sanitationScore}%)
3. Drainage System: ${village.Drainage_System || 'None'} (Score: ${drainageScore}%)

RECOMMENDATIONS
---------------
${generateRecommendations(village).map((rec, i) => `${i+1}. ${rec}`).join('\n')}

ACTION PLAN
-----------
${generateActionPlan(village).map(item => `
${item.timeframe}:
${item.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

NOTES
-----
This report is generated based on available data. Regular monitoring and community participation are essential for effective waste management.
`;
}

// Reset display
function resetDisplay() {
    const scoreValue = document.getElementById('score-value');
    const scoreStatus = document.getElementById('score-status');
    const metricsGrid = document.getElementById('metrics-grid');
    const recommendationsContent = document.getElementById('recommendations-content');
    const actionTimeline = document.getElementById('action-timeline');
    const comparisonResults = document.getElementById('comparison-results');
    
    scoreValue.textContent = '--';
    scoreStatus.textContent = 'Select a village to see waste management status';
    scoreStatus.className = 'score-status';
    metricsGrid.innerHTML = '';
    recommendationsContent.innerHTML = '<p class="placeholder">Select a village to see improvement recommendations</p>';
    actionTimeline.innerHTML = '<p class="placeholder">Select a village to see the action plan</p>';
    comparisonResults.innerHTML = '<p class="placeholder">Select two villages to compare their waste management</p>';
    
    if (wasteChart) {
        wasteChart.destroy();
        wasteChart = null;
    }
    
    currentVillage = null;
}