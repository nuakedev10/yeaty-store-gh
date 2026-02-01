// admin/js/analytics.js

const API_URL = 'http://localhost:5000/api';

// Sidebar toggle
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });
}

// Profile menu toggle
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');

if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        profileMenu.classList.toggle('hidden');
    });
}

document.addEventListener('click', (e) => {
    if (profileBtn && profileMenu && !profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.add('hidden');
    }
});

// Display admin name
const adminName = document.getElementById('adminName');
const user = JSON.parse(localStorage.getItem('user'));
if (adminName && user) {
    adminName.textContent = user.name;
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

// Chart instances
let categoryChart, stockChart, priceChart;

// Load analytics data
async function loadAnalytics() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const products = await response.json();
        
        // Calculate stats
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const inStockProducts = products.filter(p => p.inStock).length;
        const outOfStockProducts = totalProducts - inStockProducts;
        
        // Update stat cards
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('featuredProducts').textContent = featuredProducts;
        document.getElementById('inStockProducts').textContent = inStockProducts;
        document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
        
        // Calculate category distribution
        const categories = {
            'Tech Essentials Ghana': 0,
            'Fitness & Wellness Ghana': 0,
            'Fashion Ghana': 0
        };
        
        products.forEach(p => {
            if (categories.hasOwnProperty(p.category)) {
                categories[p.category]++;
            }
        });
        
        // Calculate price ranges
        const priceRanges = {
            '0-50': 0,
            '51-100': 0,
            '101-200': 0,
            '201-500': 0,
            '500+': 0
        };
        
        products.forEach(p => {
            if (p.price <= 50) priceRanges['0-50']++;
            else if (p.price <= 100) priceRanges['51-100']++;
            else if (p.price <= 200) priceRanges['101-200']++;
            else if (p.price <= 500) priceRanges['201-500']++;
            else priceRanges['500+']++;
        });
        
        // Render charts
        renderCategoryChart(categories);
        renderStockChart(inStockProducts, outOfStockProducts);
        renderPriceChart(priceRanges);
        
        // Render recent products table
        renderRecentProducts(products.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function renderCategoryChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) categoryChart.destroy();
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Tech Essentials', 'Fitness & Wellness', 'Fashion'],
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#0066CC', '#FDB813', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderStockChart(inStock, outOfStock) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (stockChart) stockChart.destroy();
    
    stockChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Out of Stock'],
            datasets: [{
                data: [inStock, outOfStock],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderPriceChart(priceRanges) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    if (priceChart) priceChart.destroy();
    
    priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['GH₵0-50', 'GH₵51-100', 'GH₵101-200', 'GH₵201-500', 'GH₵500+'],
            datasets: [{
                label: 'Number of Products',
                data: Object.values(priceRanges),
                backgroundColor: '#0066CC',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderRecentProducts(products) {
    const tbody = document.getElementById('recentProductsTable');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-gray-500">
                    No products found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                    <img src="${product.images && product.images[0] ? API_URL.replace('/api', '') + product.images[0] : 'https://via.placeholder.com/40'}" 
                         alt="${product.name}" 
                         class="w-10 h-10 rounded-lg object-cover">
                    <span class="font-medium text-gray-800">${product.name}</span>
                </div>
            </td>
            <td class="py-3 px-4 text-gray-600">${product.category}</td>
            <td class="py-3 px-4 font-semibold text-yeaty-blue">GH₵${product.price.toFixed(2)}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="py-3 px-4 text-gray-500 text-sm">
                ${new Date(product.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </td>
        </tr>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', loadAnalytics);