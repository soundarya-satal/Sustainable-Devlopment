
let villageData = [];
let charts = {};

// ==============================
// DOM Content Loaded
// ==============================
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
    setupNavigation();
});

// ==============================
// Load CSV data
// ==============================
function loadCSVData() {
    Papa.parse('andhra_pradesh_villages_clean_water_500.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            villageData = results.data.filter(row => row.Village_Name); // Filter out empty rows
            initializeDashboard();
            console.log('CSV data loaded successfully:', villageData.length, 'villages');
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            alert('Error loading village water data. Please check if the CSV file is available.');
        }
    });
}

// ==============================
// Setup event listeners
// ==============================
function setupEventListeners() {
    // Village selection
    const villageSelect = document.getElementById('village-select');
    if (villageSelect) {
        villageSelect.addEventListener('change', function() {
            updateVillageDetails(this.value);
        });
    }
    
    // District filter
    const districtSelect = document.getElementById('district-select');
    if (districtSelect) {
        districtSelect.addEventListener('change', function() {
            updateDistrictView(this.value);
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Comparison
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', compareVillages);
    }
}

// ==============================
// Setup navigation
// ==============================
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            switchSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Show overview section by default
    switchSection('overview');
}

// ==============================
// Switch sections
// ==============================
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// ==============================
// Initialize dashboard
// ==============================
function initializeDashboard() {
    populateSelectors();
    updateOverviewMetrics();
    createOverviewChart();
    createAnalysisCharts();
}

// ==============================
// Populate selectors
// ==============================
function populateSelectors() {
    // Village selectors
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');
    
    // District selector
    const districtSelect = document.getElementById('district-select');
    
    // Get unique districts
    const districts = [...new Set(villageData.map(v => v.District))].filter(Boolean).sort();
    
    // Populate district selector
    if (districtSelect) {
        // Clear existing options except the first one
        while (districtSelect.options.length > 1) {
            districtSelect.remove(1);
        }
        
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
    
    // Populate village selectors
    if (villageSelect) {
        // Clear existing options except the first one
        while (villageSelect.options.length > 1) {
            villageSelect.remove(1);
        }
        
        villageData.forEach(village => {
            if (village.Village_Code && village.Village_Name) {
                const option = document.createElement('option');
                option.value = village.Village_Code;
                option.textContent = `${village.Village_Name} (${village.District})`;
                villageSelect.appendChild(option);
            }
        });
    }
    
    // Populate comparison selectors
    if (compareVillage1 && compareVillage2) {
        // Clear existing options except the first one
        while (compareVillage1.options.length > 1) {
            compareVillage1.remove(1);
        }
        while (compareVillage2.options.length > 1) {
            compareVillage2.remove(1);
        }
        
        villageData.forEach(village => {
            if (village.Village_Code && village.Village_Name) {
                const option1 = document.createElement('option');
                option1.value = village.Village_Code;
                option1.textContent = `${village.Village_Name} (${village.District})`;
                
                const option2 = option1.cloneNode(true);
                
                compareVillage1.appendChild(option1);
                compareVillage2.appendChild(option2);
            }
        });
    }
}

// ==============================
// Update overview metrics
// ==============================
function updateOverviewMetrics() {
    // Calculate average water access percentage
    const waterAccessValues = villageData.filter(v => v.Clean_Water_Access_Percent != null).map(v => v.Clean_Water_Access_Percent);
    const avgWaterAccess = waterAccessValues.length > 0 ? waterAccessValues.reduce((sum, val) => sum + val, 0) / waterAccessValues.length : 0;
    
    // Get primary water sources
    const waterSources = villageData.map(v => v.Primary_Water_Source).filter(Boolean);
    const uniqueSources = [...new Set(waterSources)];
    
    // Calculate villages with good quality water
    const goodQualityCount = villageData.filter(v => v.Water_Quality_Rating === 'Good' || v.Water_Quality_Rating === 'Excellent').length;
    const goodQualityPercent = (goodQualityCount / villageData.length) * 100;
    
    // Calculate average supply hours
    const supplyHours = villageData.filter(v => v.Hours_of_Water_Supply_Per_Day != null).map(v => v.Hours_of_Water_Supply_Per_Day);
    const avgSupplyHours = supplyHours.length > 0 ? supplyHours.reduce((sum, val) => sum + val, 0) / supplyHours.length : 0;
    
    // Update DOM elements
    const avgWaterAccessEl = document.getElementById('avg-water-access');
    if (avgWaterAccessEl) avgWaterAccessEl.textContent = `${avgWaterAccess.toFixed(1)}%`;
    
    const waterSourcesEl = document.getElementById('water-sources');
    if (waterSourcesEl) waterSourcesEl.textContent = uniqueSources.length;
    
    const goodQualityEl = document.getElementById('good-quality');
    if (goodQualityEl) goodQualityEl.textContent = `${goodQualityPercent.toFixed(1)}%`;
    
    const avgSupplyHoursEl = document.getElementById('avg-supply-hours');
    if (avgSupplyHoursEl) avgSupplyHoursEl.textContent = `${avgSupplyHours.toFixed(1)} hrs/day`;
}

// ==============================
// Create overview chart
// ==============================
function createOverviewChart() {
    const ctx = document.getElementById('waterAccessChart');
    if (!ctx) return;
    
    // Group data by district
    const districtData = {};
    villageData.forEach(village => {
        if (!village.District || village.Clean_Water_Access_Percent == null) return;
        
        if (!districtData[village.District]) {
            districtData[village.District] = [];
        }
        districtData[village.District].push(village.Clean_Water_Access_Percent);
    });
    
    // Calculate averages
    const districts = Object.keys(districtData);
    const averages = districts.map(district => {
        const values = districtData[district];
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    if (charts.waterAccessChart) charts.waterAccessChart.destroy();
    
    charts.waterAccessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: districts,
            datasets: [{
                label: 'Average Water Access (%)',
                data: averages,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Water Access by District'
                }
            }
        }
    });
}

// ==============================
// Update district view
// ==============================
function updateDistrictView(selectedDistrict) {
    const ctx = document.getElementById('districtChart');
    if (!ctx) return;
    
    let dataToShow = villageData;
    let chartTitle = 'All Districts - Water Access';
    
    if (selectedDistrict) {
        dataToShow = villageData.filter(v => v.District === selectedDistrict);
        chartTitle = `${selectedDistrict} - Village Water Access`;
    }
    
    // Get top 20 villages for better visibility
    const sortedVillages = dataToShow
        .filter(v => v.Clean_Water_Access_Percent != null)
        .sort((a, b) => b.Clean_Water_Access_Percent - a.Clean_Water_Access_Percent)
        .slice(0, 20);
    
    const villageNames = sortedVillages.map(v => v.Village_Name);
    const waterAccess = sortedVillages.map(v => v.Clean_Water_Access_Percent);
    
    if (charts.districtChart) charts.districtChart.destroy();
    
    charts.districtChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: villageNames,
            datasets: [{
                label: 'Water Access (%)',
                data: waterAccess,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle
                }
            }
        }
    });
}

// ==============================
// Apply filters
// ==============================
function applyFilters() {
    const selectedDistrict = document.getElementById('district-select').value;
    updateDistrictView(selectedDistrict);
}

// ==============================
// Update village details
// ==============================
function updateVillageDetails(villageCode) {
    const village = villageData.find(v => v.Village_Code == villageCode);
    const card = document.getElementById('village-details-card');
    
    if (!village) {
        card.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-search"></i>
                <p>Select a village to view detailed information</p>
            </div>
        `;
        return;
    }
    
    card.innerHTML = `
        <div class="village-details-content">
            <div class="village-basic-info">
                <h3>${village.Village_Name || 'Unknown'}</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">District:</span>
                        <span class="info-value">${village.District || '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Population:</span>
                        <span class="info-value">${village.Population || '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Water Access:</span>
                        <span class="info-value">${village.Clean_Water_Access_Percent != null ? village.Clean_Water_Access_Percent + '%' : '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Primary Water Source:</span>
                        <span class="info-value">${village.Primary_Water_Source || '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Water Quality:</span>
                        <span class="info-value">${village.Water_Quality_Rating || '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Daily Supply Hours:</span>
                        <span class="info-value">${village.Hours_of_Water_Supply_Per_Day != null ? village.Hours_of_Water_Supply_Per_Day + ' hrs' : '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Government Schemes:</span>
                        <span class="info-value">${village.Government_Schemes_Active || '--'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Distance to Source:</span>
                        <span class="info-value">${village.School_Distance_km != null ? village.School_Distance_km + ' km' : '--'}</span>
                    </div>
                </div>
            </div>
            <div class="village-metrics">
                <h3>Key Metrics</h3>
                <div class="metric">
                    <div class="metric-label">
                        <span>Water Access</span>
                        <span>${village.Clean_Water_Access_Percent || 0}%</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${village.Clean_Water_Access_Percent || 0}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-label">
                        <span>Toilet Access</span>
                        <span>${village.Toilet_Access_Percent || 0}%</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${village.Toilet_Access_Percent || 0}%"></div>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-label">
                        <span>Electricity Access</span>
                        <span>${village.Electricity_Access_Percent || 0}%</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${village.Electricity_Access_Percent || 0}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==============================
// Compare villages
// ==============================
function compareVillages() {
    const villageCode1 = document.getElementById('compare-village-1').value;
    const villageCode2 = document.getElementById('compare-village-2').value;
    
    if (!villageCode1 || !villageCode2) {
        alert('Please select both villages to compare.');
        return;
    }
    
    if (villageCode1 === villageCode2) {
        alert('Please select two different villages to compare.');
        return;
    }
    
    const village1 = villageData.find(v => v.Village_Code == villageCode1);
    const village2 = villageData.find(v => v.Village_Code == villageCode2);
    
    if (!village1 || !village2) {
        alert('Error finding selected villages.');
        return;
    }
    
    const resultsDiv = document.getElementById('comparison-results');
    resultsDiv.innerHTML = `
        <h3>Comparison Results</h3>
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
                    <td>District</td>
                    <td>${village1.District || '--'}</td>
                    <td>${village2.District || '--'}</td>
                </tr>
                <tr>
                    <td>Water Access (%)</td>
                    <td>${village1.Clean_Water_Access_Percent != null ? village1.Clean_Water_Access_Percent + '%' : '--'}</td>
                    <td>${village2.Clean_Water_Access_Percent != null ? village2.Clean_Water_Access_Percent + '%' : '--'}</td>
                </tr>
                <tr>
                    <td>Primary Water Source</td>
                    <td>${village1.Primary_Water_Source || '--'}</td>
                    <td>${village2.Primary_Water_Source || '--'}</td>
                </tr>
                <tr>
                    <td>Water Quality</td>
                    <td>${village1.Water_Quality_Rating || '--'}</td>
                    <td>${village2.Water_Quality_Rating || '--'}</td>
                </tr>
                <tr>
                    <td>Supply Hours</td>
                    <td>${village1.Hours_of_Water_Supply_Per_Day != null ? village1.Hours_of_Water_Supply_Per_Day + ' hrs' : '--'}</td>
                    <td>${village2.Hours_of_Water_Supply_Per_Day != null ? village2.Hours_of_Water_Supply_Per_Day + ' hrs' : '--'}</td>
                </tr>
                <tr>
                    <td>Toilet Access (%)</td>
                    <td>${village1.Toilet_Access_Percent != null ? village1.Toilet_Access_Percent + '%' : '--'}</td>
                    <td>${village2.Toilet_Access_Percent != null ? village2.Toilet_Access_Percent + '%' : '--'}</td>
                </tr>
                <tr>
                    <td>Electricity Access (%)</td>
                    <td>${village1.Electricity_Access_Percent != null ? village1.Electricity_Access_Percent + '%' : '--'}</td>
                    <td>${village2.Electricity_Access_Percent != null ? village2.Electricity_Access_Percent + '%' : '--'}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// ==============================
// Create analysis charts
// ==============================
function createAnalysisCharts() {
    createSourceChart();
    createQualityChart();
    createSupplyChart();
    createSchemesChart();
}

// ==============================
// Water source distribution chart
// ==============================
function createSourceChart() {
    const ctx = document.getElementById('sourceChart');
    if (!ctx) return;
    
    const sourceCounts = {};
    villageData.forEach(village => {
        const source = village.Primary_Water_Source || 'Unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    if (charts.sourceChart) charts.sourceChart.destroy();
    
    charts.sourceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(sourceCounts),
            datasets: [{
                data: Object.values(sourceCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Water Source Distribution'
                }
            }
        }
    });
}

// ==============================
// Water quality rating chart
// ==============================
function createQualityChart() {
    const ctx = document.getElementById('qualityChart');
    if (!ctx) return;
    
    const qualityCounts = {};
    villageData.forEach(village => {
        const quality = village.Water_Quality_Rating || 'Unknown';
        qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
    });
    
    if (charts.qualityChart) charts.qualityChart.destroy();
    
    charts.qualityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(qualityCounts),
            datasets: [{
                data: Object.values(qualityCounts),
                backgroundColor: [
                    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Water Quality Distribution'
                }
            }
        }
    });
}

// ==============================
// Supply hours distribution chart
// ==============================
function createSupplyChart() {
    const ctx = document.getElementById('supplyChart');
    if (!ctx) return;
    
    // Create supply hour ranges
    const supplyRanges = {
        '0-6 hours': 0,
        '6-12 hours': 0,
        '12-18 hours': 0,
        '18-24 hours': 0
    };
    
    villageData.forEach(village => {
        const hours = village.Hours_of_Water_Supply_Per_Day;
        if (hours != null) {
            if (hours <= 6) supplyRanges['0-6 hours']++;
            else if (hours <= 12) supplyRanges['6-12 hours']++;
            else if (hours <= 18) supplyRanges['12-18 hours']++;
            else supplyRanges['18-24 hours']++;
        }
    });
    
    if (charts.supplyChart) charts.supplyChart.destroy();
    
    charts.supplyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(supplyRanges),
            datasets: [{
                label: 'Number of Villages',
                data: Object.values(supplyRanges),
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Water Supply Hours'
                }
            }
        }
    });
}

// ==============================
// Government schemes impact chart
// ==============================
function createSchemesChart() {
    const ctx = document.getElementById('schemesChart');
    if (!ctx) return;
    
    const schemesCounts = {};
    villageData.forEach(village => {
        const schemes = village.Government_Schemes_Active || 'None';
        schemesCounts[schemes] = (schemesCounts[schemes] || 0) + 1;
    });
    
    if (charts.schemesChart) charts.schemesChart.destroy();
    
    charts.schemesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(schemesCounts),
            datasets: [{
                label: 'Number of Villages',
                data: Object.values(schemesCounts),
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Government Schemes Implementation'
                }
            }
        }
    });
}
