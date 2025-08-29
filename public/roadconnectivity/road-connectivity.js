let villageData = [];
let currentVillage = null;
let roadChart = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

// Load CSV data
function loadCSVData() {
    // Use PapaParse to load the CSV file
    Papa.parse('andhra_pradesh_villages_road_connectivity.csv', {
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

// Calculate road connectivity score
function calculateRoadScore(village) {
    let score = 0;
    
    // Percentage of paved roads (40% weight)
    score += (village.percentage_paved_roads || 0) * 0.4;
    
    // Road quality (20% weight)
    const qualityScore = calculateQualityScore(village.internal_road_quality);
    score += qualityScore * 20;
    
    // Main road access (15% weight)
    const accessScore = Math.max(0, 100 - (village.main_road_access || 0));
    score += accessScore * 0.15;
    
    // Public transport availability (15% weight)
    const transportScore = calculateTransportScore(village.public_transport_availability);
    score += transportScore * 15;
    
    // Seasonal accessibility (10% weight)
    const seasonalScore = calculateSeasonalScore(village.seasonal_accessibility);
    score += seasonalScore * 10;
    
    return Math.min(100, Math.round(score));
}

// Calculate road quality score
function calculateQualityScore(quality) {
    switch(quality) {
        case 'Good': return 100;
        case 'Average': return 60;
        case 'Poor': return 30;
        default: return 20;
    }
}

// Calculate transport availability score
function calculateTransportScore(transport) {
    if (transport === 'Yes - High Frequency') return 100;
    if (transport === 'Yes - Low Frequency') return 70;
    if (transport === 'No') return 20;
    return 30;
}

// Calculate seasonal accessibility score
function calculateSeasonalScore(accessibility) {
    return accessibility === 'All-weather' ? 100 : 40;
}

// Update score display
function updateScoreDisplay(village) {
    const scoreValue = document.getElementById('score-value');
    const score = calculateRoadScore(village);
    scoreValue.textContent = `${score}`;
    
    // Update the score circle
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--p', `${score}%`);
}

// Update status display
function updateStatusDisplay(village) {
    const scoreStatus = document.getElementById('score-status');
    const score = calculateRoadScore(village);
    
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
    const ctx = document.getElementById('roadChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (roadChart) {
        roadChart.destroy();
    }
    
    // Calculate metrics for the chart
    const pavedScore = village.percentage_paved_roads || 0;
    const qualityScore = calculateQualityScore(village.internal_road_quality) || 0;
    const accessScore = Math.max(0, 100 - (village.main_road_access || 0));
    const transportScore = calculateTransportScore(village.public_transport_availability) || 0;
    const seasonalScore = calculateSeasonalScore(village.seasonal_accessibility) || 0;
    
    roadChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Paved Roads', 'Road Quality', 'Road Access', 'Transport', 'All-weather Access'],
            datasets: [{
                label: village.Village_Name,
                data: [pavedScore, qualityScore, accessScore, transportScore, seasonalScore],
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                borderColor: 'rgba(25, 118, 210, 1)',
                pointBackgroundColor: 'rgba(25, 118, 210, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(25, 118, 210, 1)'
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

// Update metrics breakdown
function updateMetricsBreakdown(village) {
    const metricsGrid = document.getElementById('metrics-grid');
    
    const pavedScore = village.percentage_paved_roads || 0;
    const qualityScore = calculateQualityScore(village.internal_road_quality);
    const accessScore = Math.max(0, 100 - (village.main_road_access || 0));
    const transportScore = calculateTransportScore(village.public_transport_availability);
    const seasonalScore = calculateSeasonalScore(village.seasonal_accessibility);
    
    metricsGrid.innerHTML = `
        <div class="metric-item">
            <h3>Paved Roads</h3>
            <div class="metric-value">${village.percentage_paved_roads || 0}%</div>
            <span class="metric-status ${getStatusClass(pavedScore)}">${getStatusText(pavedScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Road Quality</h3>
            <div class="metric-value">${village.internal_road_quality || 'Unknown'}</div>
            <span class="metric-status ${getStatusClass(qualityScore)}">${getStatusText(qualityScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Distance to Main Road</h3>
            <div class="metric-value">${village.main_road_access || 0} km</div>
            <span class="metric-status ${getStatusClass(accessScore)}">${getStatusText(accessScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Public Transport</h3>
            <div class="metric-value">${village.public_transport_availability || 'No'}</div>
            <span class="metric-status ${getStatusClass(transportScore)}">${getStatusText(transportScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Seasonal Access</h3>
            <div class="metric-value">${village.seasonal_accessibility || 'Unknown'}</div>
            <span class="metric-status ${getStatusClass(seasonalScore)}">${getStatusText(seasonalScore)}</span>
        </div>
        <div class="metric-item">
            <h3>Street Lighting</h3>
            <div class="metric-value">${village.street_lighting_on_roads || 0}%</div>
            <span class="metric-status ${getStatusClass(village.street_lighting_on_roads || 0)}">${getStatusText(village.street_lighting_on_roads || 0)}</span>
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
    const score = calculateRoadScore(village);
    
    if (score < 40) {
        recommendations.push("Priority: Immediate road infrastructure development needed");
        recommendations.push("Develop all-weather road connectivity to the village");
    }
    
    if ((village.percentage_paved_roads || 0) < 50) {
        recommendations.push("Increase paved road coverage to improve connectivity");
    }
    
    if (village.internal_road_quality === 'Poor') {
        recommendations.push("Upgrade internal road quality with proper drainage");
    }
    
    if ((village.main_road_access || 0) > 10) {
        recommendations.push("Develop shorter access routes to main roads");
    }
    
    if (village.public_transport_availability === 'No') {
        recommendations.push("Introduce public transportation services");
    } else if (village.public_transport_availability === 'Yes - Low Frequency') {
        recommendations.push("Increase frequency of public transportation");
    }
    
    if (village.seasonal_accessibility !== 'All-weather') {
        recommendations.push("Improve road infrastructure for all-weather access");
    }
    
    if ((village.street_lighting_on_roads || 0) < 50) {
        recommendations.push("Install street lighting for safer night travel");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Maintain current road infrastructure with regular maintenance");
        recommendations.push("Consider pedestrian pathways and cycling infrastructure");
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
    const score = calculateRoadScore(village);
    
    if (score < 40) {
        return [
            {
                timeframe: "Immediate (0-1 month)",
                actions: [
                    "Conduct detailed road condition assessment",
                    "Prioritize critical repairs on existing roads",
                    "Clear drainage systems to prevent water logging"
                ]
            },
            {
                timeframe: "Short-term (1-3 months)",
                actions: [
                    "Begin construction of all-weather road access",
                    "Install basic street lighting in critical areas",
                    "Coordinate with transport department for bus services"
                ]
            },
            {
                timeframe: "Medium-term (3-6 months)",
                actions: [
                    "Complete paving of main village roads",
                    "Improve drainage systems alongside roads",
                    "Establish regular public transport service"
                ]
            },
            {
                timeframe: "Long-term (6+ months)",
                actions: [
                    "Develop complete road network within village",
                    "Implement smart traffic management systems",
                    "Create pedestrian-friendly pathways"
                ]
            }
        ];
    } else if (score < 70) {
        return [
            {
                timeframe: "Short-term (1-2 months)",
                actions: [
                    "Improve road maintenance schedule",
                    "Upgrade poor quality road sections",
                    "Increase public transport frequency"
                ]
            },
            {
                timeframe: "Medium-term (2-4 months)",
                actions: [
                    "Expand paved road network",
                    "Install comprehensive street lighting",
                    "Develop proper road signage"
                ]
            },
            {
                timeframe: "Long-term (4+ months)",
                actions: [
                    "Implement road safety measures",
                    "Develop cycling infrastructure",
                    "Create green spaces along roads"
                ]
            }
        ];
    } else {
        return [
            {
                timeframe: "Ongoing",
                actions: [
                    "Maintain current road infrastructure",
                    "Regular inspection and repair cycles",
                    "Continue community engagement on road safety"
                ]
            },
            {
                timeframe: "Improvement",
                actions: [
                    "Implement smart road technologies",
                    "Develop eco-friendly road solutions",
                    "Enhance public transportation integration"
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
    
    const score1 = calculateRoadScore(village1);
    const score2 = calculateRoadScore(village2);
    
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
                    <td>Road Connectivity Score</td>
                    <td>${score1}</td>
                    <td>${score2}</td>
                </tr>
                <tr>
                    <td>Paved Roads</td>
                    <td>${village1.percentage_paved_roads || 0}%</td>
                    <td>${village2.percentage_paved_roads || 0}%</td>
                </tr>
                <tr>
                    <td>Road Quality</td>
                    <td>${village1.internal_road_quality || 'Unknown'}</td>
                    <td>${village2.internal_road_quality || 'Unknown'}</td>
                </tr>
                <tr>
                    <td>Distance to Main Road</td>
                    <td>${village1.main_road_access || 0} km</td>
                    <td>${village2.main_road_access || 0} km</td>
                </tr>
                <tr>
                    <td>Public Transport</td>
                    <td>${village1.public_transport_availability || 'No'}</td>
                    <td>${village2.public_transport_availability || 'No'}</td>
                </tr>
                <tr>
                    <td>Seasonal Access</td>
                    <td>${village1.seasonal_accessibility || 'Unknown'}</td>
                    <td>${village2.seasonal_accessibility || 'Unknown'}</td>
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
    a.download = `${currentVillage.Village_Name}_Road_Connectivity_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate report content
function generateReportContent(village) {
    const score = calculateRoadScore(village);
    
    return `
ROAD CONNECTIVITY REPORT
========================

Village: ${village.Village_Name}
District: ${village.District}
Report Date: ${new Date().toLocaleDateString()}

SUMMARY
--------
Road Connectivity Score: ${score}
Overall Status: ${getStatusText(score)}

DETAILED METRICS
----------------
1. Total Road Length: ${village.total_road_length || 0} km
2. Paved Road Length: ${village.paved_road_length || 0} km
3. Percentage Paved Roads: ${village.percentage_paved_roads || 0}%
4. Internal Road Quality: ${village.internal_road_quality || 'Unknown'}
5. Distance to Main Road: ${village.main_road_access || 0} km
6. Public Transport Availability: ${village.public_transport_availability || 'No'}
7. Seasonal Accessibility: ${village.seasonal_accessibility || 'Unknown'}
8. Street Lighting on Roads: ${village.street_lighting_on_roads || 0}%

RECOMMENDATIONS
---------------
${generateRecommendations(village).map((rec, i) => `${i+1}. ${rec}`).join('\n')}

ACTION PLAN
-----------
${generateActionPlan(village).map(plan => {
    return `${plan.timeframe}:\n${plan.actions.map((a, i) => `   ${i+1}. ${a}`).join('\n')}`;
}).join('\n\n')}

========================
This report is auto-generated using the Andhra Pradesh Village Road Connectivity Dashboard.
`;
}

// Reset display when no village is selected
function resetDisplay() {
    const scoreValue = document.getElementById('score-value');
    const scoreStatus = document.getElementById('score-status');
    const metricsGrid = document.getElementById('metrics-grid');
    const recommendationsContent = document.getElementById('recommendations-content');
    const actionTimeline = document.getElementById('action-timeline');

    scoreValue.textContent = '--';
    scoreStatus.textContent = '--';
    scoreStatus.className = 'score-status';
    metricsGrid.innerHTML = '';
    recommendationsContent.innerHTML = '<p class="placeholder">Select a village to view recommendations</p>';
    actionTimeline.innerHTML = '<p class="placeholder">Select a village to view action plan</p>';

    if (roadChart) {
        roadChart.destroy();
        roadChart = null;
    }
}
