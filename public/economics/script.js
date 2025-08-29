let villageData = [];
let currentVillage = null;
let charts = {};
let villagePieChart = null; // global variable


// ==============================
// DOM Content Loaded
// ==============================
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

// ==============================
// Load CSV data
// ==============================
function loadCSVData() {
    Papa.parse('andhra_pradesh_villages_economic.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            villageData = results.data;
            initializeDashboard();
            console.log('CSV data loaded successfully:', villageData.length, 'villages');
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            alert('Error loading village data. Please check if the CSV file is available.');
        }
    });
}

// ==============================
// Setup event listeners
// ==============================
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Village selection
    const villageSelect = document.getElementById('village-select');
    villageSelect.addEventListener('change', function() {
        updateVillageDetails(this.value);
    });
    
    // Filters
    document.getElementById('district-filter').addEventListener('change', filterVillageTable);
    document.getElementById('occupation-filter').addEventListener('change', filterVillageTable);
    document.getElementById('credit-filter').addEventListener('change', filterVillageTable);
    
    // Comparison
    document.getElementById('compare-btn').addEventListener('click', compareVillages);
    
    // District analysis
    document.getElementById('district-select').addEventListener('change', function() {
        updateDistrictAnalysis(this.value);
    });
}

// ==============================
// Initialize dashboard
// ==============================
function initializeDashboard() {
    populateVillageSelectors();
    populateDistrictFilters();
    updateOverviewMetrics();
    createOverviewCharts();
    populateVillageTable();
}

// ==============================
// Switch sections
// ==============================
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Refresh charts if needed
    if (sectionId === 'overview' && Object.keys(charts).length === 0) {
        createOverviewCharts();
    }
}

// ==============================
// Populate village selectors
// ==============================
function populateVillageSelectors() {
    const villageSelect = document.getElementById('village-select');
    const compareVillage1 = document.getElementById('compare-village-1');
    const compareVillage2 = document.getElementById('compare-village-2');

    villageSelect.innerHTML = '<option value="">-- Select a Village --</option>';
    compareVillage1.innerHTML = '<option value="">-- Select Village --</option>';
    compareVillage2.innerHTML = '<option value="">-- Select Village --</option>';

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

// ==============================
// Populate district filters
// ==============================
function populateDistrictFilters() {
    const districtFilter = document.getElementById('district-filter');
    const districtSelect = document.getElementById('district-select');

    const districts = [...new Set(villageData.map(v => v.District))].filter(Boolean).sort();

    districts.forEach(district => {
        const option1 = document.createElement('option');
        option1.value = district;
        option1.textContent = district;

        const option2 = option1.cloneNode(true);

        districtFilter.appendChild(option1);
        districtSelect.appendChild(option2);
    });
}

// ==============================
// Update overview metrics
// ==============================
function updateOverviewMetrics() {
    const totalIncome = villageData.reduce((sum, v) => sum + (v.average_income_per_household || 0), 0);
    const avgIncome = totalIncome / villageData.length;

    const totalEmployment = villageData.reduce((sum, v) => sum + (v.employment_rate || 0), 0);
    const avgEmployment = totalEmployment / villageData.length;

    const totalPoverty = villageData.reduce((sum, v) => sum + (v.poverty_rate || 0), 0);
    const avgPoverty = totalPoverty / villageData.length;

    const villagesWithCredit = villageData.filter(v => v.access_to_credit && v.access_to_credit.startsWith('Yes')).length;
    const creditAccessPercent = (villagesWithCredit / villageData.length) * 100;

    document.getElementById('avg-income').textContent = `₹${avgIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    document.getElementById('avg-employment').textContent = `${avgEmployment.toFixed(1)}%`;
    document.getElementById('avg-poverty').textContent = `${avgPoverty.toFixed(1)}%`;
    document.getElementById('credit-access').textContent = `${creditAccessPercent.toFixed(1)}%`;
}

// ==============================
// Populate village table
// ==============================
function populateVillageTable() {
    const tbody = document.querySelector('#village-table tbody');
    tbody.innerHTML = '';

    villageData.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${v.Village_Code || '--'}</td>
            <td>${v.Village_Name || '--'}</td>
            <td>${v.District || '--'}</td>
            <td>${v.main_occupation || '--'}</td>
            <td>${v.employment_rate ? v.employment_rate.toFixed(1)+'%' : '--'}</td>
            <td>${v.average_income_per_household ? `₹${v.average_income_per_household.toLocaleString('en-IN')}` : '--'}</td>
            <td>${v.poverty_rate ? v.poverty_rate.toFixed(1)+'%' : '--'}</td>
            <td>${v.access_to_credit || '--'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==============================
// Filter village table
// ==============================
function filterVillageTable() {
    const district = document.getElementById('district-filter').value;
    const occupation = document.getElementById('occupation-filter').value;
    const credit = document.getElementById('credit-filter').value;

    const tbody = document.querySelector('#village-table tbody');
    tbody.innerHTML = '';

    const filtered = villageData.filter(v => {
        return (!district || v.District === district) &&
               (!occupation || v.main_occupation === occupation) &&
               (!credit || (credit === 'Yes' ? v.access_to_credit.startsWith('Yes') : !v.access_to_credit || v.access_to_credit.startsWith('No')));
    });

    filtered.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${v.Village_Code || '--'}</td>
            <td>${v.Village_Name || '--'}</td>
            <td>${v.District || '--'}</td>
            <td>${v.main_occupation || '--'}</td>
            <td>${v.employment_rate ? v.employment_rate.toFixed(1)+'%' : '--'}</td>
            <td>${v.average_income_per_household ? `₹${v.average_income_per_household.toLocaleString('en-IN')}` : '--'}</td>
            <td>${v.poverty_rate ? v.poverty_rate.toFixed(1)+'%' : '--'}</td>
            <td>${v.access_to_credit || '--'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==============================
// Update village details
// ==============================
function updateVillageDetails(villageCode) {
    const village = villageData.find(v => v.Village_Code == villageCode);
    const card = document.getElementById('village-details-card');

    if (!village) {
        card.classList.add('hidden');
        return;
    }

    card.classList.remove('hidden');
    document.getElementById('village-name').textContent = village.Village_Name || '--';
    document.getElementById('detail-district').textContent = village.District || '--';
    document.getElementById('detail-occupation').textContent = village.main_occupation || '--';
    document.getElementById('detail-employment').textContent = village.employment_rate ? village.employment_rate.toFixed(1)+'%' : '--';
    document.getElementById('detail-income').textContent = village.average_income_per_household ? `₹${village.average_income_per_household.toLocaleString('en-IN')}` : '--';
    document.getElementById('detail-poverty').textContent = village.poverty_rate ? village.poverty_rate.toFixed(1)+'%' : '--';
    document.getElementById('detail-credit').textContent = village.access_to_credit || '--';
}

// ==============================
// Compare Villages
// ==============================
function compareVillages() {
    const villageCode1 = document.getElementById('compare-village-1').value;
    const villageCode2 = document.getElementById('compare-village-2').value;

    const village1 = villageData.find(v => v.Village_Code == villageCode1);
    const village2 = villageData.find(v => v.Village_Code == villageCode2);

    if (!village1 || !village2) {
        alert('Please select both villages to compare.');
        return;
    }

    document.getElementById('comparison-results').classList.remove('hidden');
    document.getElementById('compare-name-1').textContent = village1.Village_Name;
    document.getElementById('compare-name-2').textContent = village2.Village_Name;

    const metrics1 = document.getElementById('compare-metrics-1');
    const metrics2 = document.getElementById('compare-metrics-2');

    metrics1.innerHTML = `
        <p>District: ${village1.District}</p>
        <p>Main Occupation: ${village1.main_occupation || '--'}</p>
        <p>Employment Rate: ${village1.employment_rate ? village1.employment_rate.toFixed(1)+'%' : '--'}</p>
        <p>Average Income: ${village1.average_income_per_household ? `₹${village1.average_income_per_household.toLocaleString('en-IN')}` : '--'}</p>
        <p>Poverty Rate: ${village1.poverty_rate ? village1.poverty_rate.toFixed(1)+'%' : '--'}</p>
        <p>Credit Access: ${village1.access_to_credit || '--'}</p>
    `;

    metrics2.innerHTML = `
        <p>District: ${village2.District}</p>
        <p>Main Occupation: ${village2.main_occupation || '--'}</p>
        <p>Employment Rate: ${village2.employment_rate ? village2.employment_rate.toFixed(1)+'%' : '--'}</p>
        <p>Average Income: ${village2.average_income_per_household ? `₹${village2.average_income_per_household.toLocaleString('en-IN')}` : '--'}</p>
        <p>Poverty Rate: ${village2.poverty_rate ? village2.poverty_rate.toFixed(1)+'%' : '--'}</p>
        <p>Credit Access: ${village2.access_to_credit || '--'}</p>
    `;

    // Comparison Chart
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (charts.comparisonChart) charts.comparisonChart.destroy();

    charts.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Employment Rate', 'Average Income', 'Poverty Rate'],
            datasets: [
                {
                    label: village1.Village_Name,
                    data: [
                        village1.employment_rate || 0,
                        village1.average_income_per_household || 0,
                        village1.poverty_rate || 0
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: village2.Village_Name,
                    data: [
                        village2.employment_rate || 0,
                        village2.average_income_per_household || 0,
                        village2.poverty_rate || 0
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            if (context.label.includes('Income')) return `₹${value.toLocaleString('en-IN')}`;
                            return `${value}%`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ==============================
// Update district analysis
// ==============================
function updateDistrictAnalysis(districtName) {
    const districtVillages = villageData.filter(v => v.District === districtName);
    if (!districtVillages.length) {
        document.getElementById('district-details').classList.add('hidden');
        return;
    }

    document.getElementById('district-details').classList.remove('hidden');
    document.getElementById('district-name').textContent = districtName;

    const avgIncome = districtVillages.reduce((sum, v) => sum + (v.average_income_per_household || 0), 0) / districtVillages.length;
    const avgEmployment = districtVillages.reduce((sum, v) => sum + (v.employment_rate || 0), 0) / districtVillages.length;
    const avgPoverty = districtVillages.reduce((sum, v) => sum + (v.poverty_rate || 0), 0) / districtVillages.length;
    const creditPercent = (districtVillages.filter(v => v.access_to_credit && v.access_to_credit.startsWith('Yes')).length / districtVillages.length) * 100;

    document.getElementById('district-income').textContent = `₹${avgIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    document.getElementById('district-employment').textContent = `${avgEmployment.toFixed(1)}%`;
    document.getElementById('district-poverty').textContent = `${avgPoverty.toFixed(1)}%`;
    document.getElementById('district-credit').textContent = `${creditPercent.toFixed(1)}%`;

    // Top villages
    const topIncomeVillage = districtVillages.reduce((prev, curr) => (curr.average_income_per_household > (prev.average_income_per_household || 0) ? curr : prev), {});
    const topEmploymentVillage = districtVillages.reduce((prev, curr) => (curr.employment_rate > (prev.employment_rate || 0) ? curr : prev), {});
    const lowPovertyVillage = districtVillages.reduce((prev, curr) => (curr.poverty_rate < (prev.poverty_rate || Infinity) ? curr : prev), {});

    document.getElementById('top-income-village').textContent = topIncomeVillage.Village_Name || '--';
    document.getElementById('top-employment-village').textContent = topEmploymentVillage.Village_Name || '--';
    document.getElementById('low-poverty-village').textContent = lowPovertyVillage.Village_Name || '--';

    // District Occupation Chart
    const occupationCounts = {};
    districtVillages.forEach(v => {
        const occ = v.main_occupation || 'Unknown';
        occupationCounts[occ] = (occupationCounts[occ] || 0) + 1;
    });

    const occLabels = Object.keys(occupationCounts);
    const occValues = Object.values(occupationCounts);
    const occCtx = document.getElementById('districtOccupationChart').getContext('2d');
    if (charts.districtOccupationChart) charts.districtOccupationChart.destroy();

    charts.districtOccupationChart = new Chart(occCtx, {
        type: 'pie',
        data: {
            labels: occLabels,
            datasets: [{ data: occValues, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'] }]
        },
        options: { responsive: true }
    });

    // District Credit Chart
    const creditCounts = {
        Yes: districtVillages.filter(v => v.access_to_credit && v.access_to_credit.startsWith('Yes')).length,
        No: districtVillages.filter(v => !v.access_to_credit || v.access_to_credit.startsWith('No')).length
    };
    const creditCtx = document.getElementById('districtCreditChart').getContext('2d');
    if (charts.districtCreditChart) charts.districtCreditChart.destroy();

    charts.districtCreditChart = new Chart(creditCtx, {
        type: 'doughnut',
        data: {
            labels: ['With Credit', 'Without Credit'],
            datasets: [{ data: [creditCounts.Yes, creditCounts.No], backgroundColor: ['#36A2EB', '#FF6384'] }]
        },
        options: { responsive: true }
    });
}

// ==============================
// Overview Charts
// ==============================
function createOverviewCharts() {
    createIncomeChart();
    createEmploymentChart();
    createOccupationChart();
}

// ==============================
// Income Chart
// ==============================
function createIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    const districtIncome = {};
    villageData.forEach(v => {
        if (!v.District || !v.average_income_per_household) return;
        if (!districtIncome[v.District]) districtIncome[v.District] = { total:0, count:0 };
        districtIncome[v.District].total += v.average_income_per_household;
        districtIncome[v.District].count += 1;
    });

    const districts = Object.keys(districtIncome);
    const avgIncomes = districts.map(d => districtIncome[d].total / districtIncome[d].count);

    charts.incomeChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: districts, datasets: [{ label: 'Average Income', data: avgIncomes, backgroundColor: 'rgba(75, 192, 192, 0.7)' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// ==============================
// Employment Chart
// ==============================
function createEmploymentChart() {
    const ctx = document.getElementById('employmentChart').getContext('2d');
    const districtEmployment = {};
    villageData.forEach(v => {
        if (!v.District || !v.employment_rate) return;
        if (!districtEmployment[v.District]) districtEmployment[v.District] = { total:0, count:0 };
        districtEmployment[v.District].total += v.employment_rate;
        districtEmployment[v.District].count += 1;
    });

    const districts = Object.keys(districtEmployment);
    const avgEmployment = districts.map(d => districtEmployment[d].total / districtEmployment[d].count);

    charts.employmentChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: districts, datasets: [{ label: 'Average Employment', data: avgEmployment, backgroundColor: 'rgba(153, 102, 255, 0.7)' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// ==============================
// Occupation Chart
// ==============================
function createOccupationChart() {
    const ctx = document.getElementById('occupationChart').getContext('2d');
    const occupationCounts = {};
    villageData.forEach(v => {
        const occ = v.main_occupation || 'Unknown';
        occupationCounts[occ] = (occupationCounts[occ] || 0) + 1;
    });

    charts.occupationChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: Object.keys(occupationCounts), datasets: [{ data: Object.values(occupationCounts), backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'] }] },
        options: { responsive: true }
    });
}



function updateVillageDetails(villageCode) {
    const village = villageData.find(v => v.Village_Code == villageCode);
    const card = document.getElementById('village-details-card');

    if (!village) {
        card.classList.add('hidden');
        return;
    }

    card.classList.remove('hidden');
    document.getElementById('village-name').textContent = village.Village_Name || '--';
    document.getElementById('detail-district').textContent = village.District || '--';
    document.getElementById('detail-occupation').textContent = village.main_occupation || '--';
    document.getElementById('detail-employment').textContent = village.employment_rate ? village.employment_rate.toFixed(1)+'%' : '--';
    document.getElementById('detail-income').textContent = village.average_income_per_household ? `₹${village.average_income_per_household.toLocaleString('en-IN')}` : '--';
    document.getElementById('detail-poverty').textContent = village.poverty_rate ? village.poverty_rate.toFixed(1)+'%' : '--';
    document.getElementById('detail-credit').textContent = village.access_to_credit || '--';

    // Pie chart data
    const employment = village.employment_rate || 0;
    const poverty = village.poverty_rate || 0;
    const credit = village.access_to_credit && village.access_to_credit.startsWith('Yes') ? 1 : 0;
    const noCredit = 1 - credit;

    const ctx = document.getElementById('villagePieChart').getContext('2d');
    if (villagePieChart) villagePieChart.destroy();

    villagePieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Employment Rate', 'Poverty Rate', 'Without Credit'],
            datasets: [{
                data: [employment, poverty, noCredit * 100],
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });
}
