// Village360 JavaScript functionality

// Color palette
const colors = {
    primaryDark: '#272757',
    primaryLight: '#8686AC',
    secondary: '#505081',
    accentDark: '#0F0E47'
};

// Translations for different languages
const translations = {
    en: {
        features: "Features",
        dashboard: "Dashboard",
        compareVillages: "Compare Villages",
        topVillages: "Top Villages",
        access: "Access",
        contact: "Contact",
        explore: "Explore Platform",
        water: "Water Access",
        education: "Education",
        healthcare: "Healthcare",
        agriculture: "Agriculture",
        infrastructure: "Infrastructure",
        strengths: "Strengths",
        viewDetails: "View Details",
        good: "Good",
        needsImprovement: "Needs Improvement",
        urgent: "Urgent Attention Needed",
        aiRecommendations: "AI-Powered Recommendations",
        recommendedActions: "Recommended Actions",
        generateRecommendation: "Generate Custom Recommendation"
    },
    hi: {
        features: "विशेषताएँ",
        dashboard: "डैशबोर्ड",
        compareVillages: "गाँवों की तुलना करें",
        topVillages: "शीर्ष गाँव",
        access: "पहुँच",
        contact: "संपर्क",
        explore: "प्लेटफॉर्म का अन्वेषण करें",
        water: "पानी की पहुँच",
        education: "शिक्षा",
        healthcare: "स्वास्थ्य देखभाल",
        agriculture: "कृषि",
        infrastructure: "बुनियादी ढांचा",
        strengths: "ताकत",
        viewDetails: "विवरण देखें",
        good: "अच्छा",
        needsImprovement: "सुधार की आवश्यकता है",
        urgent: "तत्काल ध्यान देने की आवश्यकता है",
        aiRecommendations: "एआई-संचालित अनुशंसाएँ",
        recommendedActions: "अनुशंसित कार्रवाई",
        generateRecommendation: "कस्टम अनुशंसा उत्पन्न करें"
    },
    te: {
        features: "ఫీచర్లు",
        dashboard: "డాష్‌బోర్డ్",
        compareVillages: "గ్రామాలను పోల్చండి",
        topVillages: "టాప్ గ్రామాలు",
        access: "యాక్సెస్",
        contact: "సంప్రదించండి",
        explore: "ప్లాట్‌ఫారమ్‌ను అన్వేషించండి",
        water: "నీటి యాక్సెస్",
        education: "విద్య",
        healthcare: "ఆరోగ్య సంరక్షణ",
        agriculture: "వ్యవసాయం",
        infrastructure: "మౌలిక సదుపాయాలు",
        strengths: "బలాలు",
        viewDetails: "వివరాలను వీక్షించండి",
        good: "మంచిది",
        needsImprovement: "మెరుగుదల అవసరం",
        urgent: "తక్షణ శ్రద్ధ అవసరం",
        aiRecommendations: "AI-ఆధారిత సిఫార్సులు",
        recommendedActions: "సిఫార్సు చేయబడిన చర్యలు",
        generateRecommendation: "కస్టమ్ సిఫార్సును రూపొందించండి"
    },
    ta: {
        features: "அம்சங்கள்",
        dashboard: "டாஷ்போர்டு",
        compareVillages: "கிராமங்களை ஒப்பிடுங்கள்",
        topVillages: "சிறந்த கிராமங்கள்",
        access: "அணுகல்",
        contact: "தொடர்பு",
        explore: "தளத்தை ஆராயுங்கள்",
        water: "நீர் அணுகல்",
        education: "கல்வி",
        healthcare: "சுகாதாரம்",
        agriculture: "விவசாயம்",
        infrastructure: "உள்கட்டமைப்பு",
        strengths: "பலங்கள்",
        viewDetails: "விவரங்களைக் காண்க",
        good: "நல்லது",
        needsImprovement: "மேம்பாடு தேவை",
        urgent: "அவசர கவனம் தேவை",
        aiRecommendations: "AI-இயக்கப்பட்ட பரிந்துரைகள்",
        recommendedActions: "பரிந்துரைக்கப்பட்ட செயல்கள்",
        generateRecommendation: "தனிப்பயன் பரிந்துரையை உருவாக்கவும்"
    }
};

// Current language
let currentLanguage = 'en';

// Function to change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('village360Language', lang);
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update placeholders and other attributes
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // Update status indicators text
    updateStatusIndicatorsText();
}

// Initialize language selector
function initializeLanguageSelector() {
    // Add data-translate attributes to elements
    const translatableElements = [
        { selector: '.nav-links a[href="#features"]', key: 'features' },
        { selector: '.nav-links a[href="#demo"]', key: 'dashboard' },
        { selector: '.nav-links a[href="compare.html"]', key: 'compareVillages' },
        { selector: '.nav-links a[href="#top-villages"]', key: 'topVillages' },
        { selector: '.nav-links a[href="#roles"]', key: 'access' },
        { selector: '.nav-links a[href="#contact"]', key: 'contact' },
        { selector: '.cta-button', key: 'explore' }
    ];
    
    // Apply data-translate attributes to elements with standard selectors
    translatableElements.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(element => {
            element.setAttribute('data-translate', item.key);
        });
    });
    
    // The elements below already have data-translate attributes applied in the HTML
    // so we don't need to select and apply them here
    
    // Apply translation immediately if language is not English
    if (currentLanguage !== 'en') {
        changeLanguage(currentLanguage);
    }
}

// Update status indicators text based on language
function updateStatusIndicatorsText() {
    const statusElements = document.querySelectorAll('.status-text');
    statusElements.forEach(element => {
        const status = element.getAttribute('data-status');
        if (status && translations[currentLanguage][status]) {
            element.textContent = translations[currentLanguage][status];
        }
    });
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize all functionalities
    initializeNumberAnimations();
    initializeScrollAnimations();
    initializeMobileMenu();
    initializeVSIChart();
    initializeCategoryBars();
    initializeLanguageSelector();
    initializeAIRecommendations();
    
    // Load saved language preference if exists
    const savedLanguage = localStorage.getItem('village360Language');
    if (savedLanguage) {
        changeLanguage(savedLanguage);
        document.getElementById('language-select').value = savedLanguage;
    }
});

// AI Recommendation System
function initializeAIRecommendations() {
    // Add translation attributes to AI section elements
    const aiSectionTitle = document.querySelector('.ai-recommendations h2');
    if (aiSectionTitle) {
        aiSectionTitle.setAttribute('data-translate', 'aiRecommendations');
    }
    
    document.querySelectorAll('.ai-recommendations-list h4').forEach(el => {
        el.setAttribute('data-translate', 'recommendedActions');
    });
    
    const generateButton = document.querySelector('.ai-cta button');
    if (generateButton) {
        generateButton.setAttribute('data-translate', 'generateRecommendation');
        generateButton.addEventListener('click', generateCustomRecommendation);
    }
    
    // Update translations based on current language
    changeLanguage(currentLanguage);
}

// Generate custom AI recommendation based on village data
function generateCustomRecommendation() {
    // In a real implementation, this would call an AI service API
    // For demo purposes, we'll simulate an AI response with predefined recommendations
    
    // Show loading state
    const button = document.querySelector('.ai-cta button');
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Sample village data that would normally come from the backend
        const villageData = {
            name: 'Sundarpur',
            vsi: 72,
            metrics: {
                water: 65,
                education: 78,
                healthcare: 62,
                agriculture: 80,
                infrastructure: 75
            }
        };
        
        // Generate recommendations based on the lowest scoring metrics
        const recommendations = [];
        let lowestMetric = 'water';
        let lowestScore = villageData.metrics.water;
        
        Object.entries(villageData.metrics).forEach(([metric, score]) => {
            if (score < lowestScore) {
                lowestScore = score;
                lowestMetric = metric;
            }
        });
        
        // Create a custom recommendation modal
        const modal = document.createElement('div');
        modal.className = 'ai-recommendation-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'ai-modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'ai-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.remove();
        
        const title = document.createElement('h3');
        title.textContent = `Custom AI Recommendation for ${villageData.name}`;
        
        const analysis = document.createElement('div');
        analysis.className = 'ai-modal-analysis';
        analysis.innerHTML = `
            <p><strong>Village Analysis:</strong> Based on the data, ${villageData.name} has a VSI score of ${villageData.vsi}. 
            The village is performing well in Agriculture (${villageData.metrics.agriculture}%) and Education (${villageData.metrics.education}%), 
            but needs improvement in ${lowestMetric.charAt(0).toUpperCase() + lowestMetric.slice(1)} (${villageData.metrics[lowestMetric]}%).</p>
            
            <h4>Priority Recommendations:</h4>
            <ul>
                ${getRecommendationsForMetric(lowestMetric).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <p><strong>Predicted Impact:</strong> Implementing these recommendations could improve the ${lowestMetric} score by 15-20% within 6 months.</p>
        `;
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(analysis);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// Helper function to get recommendations based on metric type
function getRecommendationsForMetric(metric) {
    const recommendations = {
        water: [
            'Implement rainwater harvesting systems in community buildings',
            'Develop a community-managed water filtration system',
            'Construct additional wells in underserved areas',
            'Implement water conservation education programs'
        ],
        education: [
            'Establish after-school tutoring programs',
            'Provide teacher training on modern teaching methodologies',
            'Develop digital learning resources for students',
            'Create a community library with educational materials'
        ],
        healthcare: [
            'Organize monthly health camps with visiting specialists',
            'Train community health workers for basic care',
            'Implement telemedicine facilities for remote consultations',
            'Create awareness programs for preventive healthcare'
        ],
        agriculture: [
            'Introduce drought-resistant crop varieties',
            'Implement modern irrigation techniques',
            'Provide training on sustainable farming practices',
            'Establish a seed bank for local farmers'
        ],
        infrastructure: [
            'Improve road connectivity to neighboring villages',
            'Develop renewable energy solutions for consistent power',
            'Construct community centers for gatherings and events',
            'Implement waste management systems'
        ]
    };
    
    return recommendations[metric] || [];
}

// Initialize VSI Chart
function initializeVSIChart() {
    const canvas = document.getElementById('vsiChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Sample data for VSI trends
    const vsiData = [
        { month: 'Jan', score: 6.2 },
        { month: 'Feb', score: 6.5 },
        { month: 'Mar', score: 6.8 },
        { month: 'Apr', score: 7.0 },
        { month: 'May', score: 7.1 },
        { month: 'Jun', score: 7.2 }
    ];
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.primaryLight);
    gradient.addColorStop(1, colors.accentDark);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(39, 39, 87, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
        const y = padding + (chartHeight / 10) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < vsiData.length; i++) {
        const x = padding + (chartWidth / (vsiData.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }
    
    // Draw the line chart
    ctx.strokeStyle = colors.primaryDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    vsiData.forEach((point, index) => {
        const x = padding + (chartWidth / (vsiData.length - 1)) * index;
        const y = canvas.height - padding - (point.score / 10) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    vsiData.forEach((point, index) => {
        const x = padding + (chartWidth / (vsiData.length - 1)) * index;
        const y = canvas.height - padding - (point.score / 10) * chartHeight;
        
        // Outer circle
        ctx.fillStyle = colors.primaryLight;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = colors.accentDark;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = colors.primaryDark;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Month labels
    vsiData.forEach((point, index) => {
        const x = padding + (chartWidth / (vsiData.length - 1)) * index;
        ctx.fillText(point.month, x, canvas.height - 20);
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
        const y = padding + (chartHeight / 10) * (10 - i);
        ctx.fillText(i.toString(), padding - 10, y + 5);
    }
    
    // Chart title
    ctx.fillStyle = colors.primaryDark;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Village Sustainability Index Progress', canvas.width / 2, 30);
}

// Initialize category progress bars
function initializeCategoryBars() {
    const categoryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const categoryItems = document.querySelectorAll('.category-item');
                categoryItems.forEach((item, index) => {
                    setTimeout(() => {
                        const fill = item.querySelector('.category-fill');
                        const score = fill.getAttribute('data-score');
                        const percentage = (score / 10) * 100;
                        fill.style.width = percentage + '%';
                    }, index * 200);
                });
                categoryObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const categoriesSection = document.querySelector('.vsi-categories');
    if (categoriesSection) {
        categoryObserver.observe(categoriesSection);
    }
}

// Animate numbers when they come into view
function initializeNumberAnimations() {
    const stats = document.querySelectorAll('.stat-number');
    const vsiScore = document.querySelector('.vsi-score');
    
    const animateNumber = (element, finalValue, duration = 2000, hasPercent = false, isDecimal = false) => {
        let startValue = 0;
        const increment = finalValue / (duration / 16);
        
        const timer = setInterval(() => {
            startValue += increment;
            if (startValue >= finalValue) {
                if (isDecimal) {
                    element.textContent = finalValue.toFixed(1);
                } else {
                    element.textContent = finalValue + (hasPercent ? '%' : '');
                }
                clearInterval(timer);
            } else {
                if (isDecimal) {
                    element.textContent = startValue.toFixed(1);
                } else {
                    element.textContent = Math.floor(startValue) + (hasPercent ? '%' : '');
                }
            }
        }, 16);
    };

    // Intersection Observer for number animations
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                if (element.classList.contains('vsi-score')) {
                    animateNumber(element, 7.2, 2000, false, true);
                } else if (text.includes('%')) {
                    const number = parseInt(text.replace('%', ''));
                    animateNumber(element, number, 2000, true);
                } else {
                    const number = parseInt(text.replace(/,/g, ''));
                    const timer = setInterval(() => {
                        const currentValue = Math.floor(Math.random() * number * 0.1) + (number * 0.9);
                        element.textContent = currentValue.toLocaleString();
                    }, 50);
                    
                    setTimeout(() => {
                        clearInterval(timer);
                        element.textContent = number.toLocaleString();
                    }, 2000);
                }
                numberObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    // Observe all stat numbers and VSI score
    [...stats, vsiScore].forEach(element => {
        if (element) numberObserver.observe(element);
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .scenario-card, .role-card, .benefit-item');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(element);
    });
}

// Initialize mobile menu (basic implementation)
function initializeMobileMenu() {
    // This would be expanded for a full mobile menu implementation
    const navLinks = document.querySelector('.nav-links');
    
    // Add mobile menu toggle button if needed
    if (window.innerWidth <= 768) {
        console.log('Mobile view detected');
        // Mobile menu functionality would go here
    }
}

// Resize chart on window resize
window.addEventListener('resize', function() {
    setTimeout(() => {
        initializeVSIChart();
    }, 300);
});