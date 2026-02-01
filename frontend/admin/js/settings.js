// admin/js/settings.js

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

// Display admin info
const adminName = document.getElementById('adminName');
const user = JSON.parse(localStorage.getItem('user'));

if (user) {
    if (adminName) adminName.textContent = user.name;
    document.getElementById('settingsName').value = user.name || '';
    document.getElementById('settingsEmail').value = user.email || '';
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

// Load saved settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('storeSettings')) || {};
    
    document.getElementById('maintenanceMode').checked = settings.maintenanceMode || false;
    document.getElementById('showOutOfStock').checked = settings.showOutOfStock !== false;
    document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
    document.getElementById('storePhone').value = settings.storePhone || '';
    document.getElementById('storeWhatsApp').value = settings.storeWhatsApp || '';
    document.getElementById('storeAddress').value = settings.storeAddress || '';
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        maintenanceMode: document.getElementById('maintenanceMode').checked,
        showOutOfStock: document.getElementById('showOutOfStock').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        storePhone: document.getElementById('storePhone').value,
        storeWhatsApp: document.getElementById('storeWhatsApp').value,
        storeAddress: document.getElementById('storeAddress').value
    };
    
    localStorage.setItem('storeSettings', JSON.stringify(settings));
}

// Auto-save toggle settings
['maintenanceMode', 'showOutOfStock', 'emailNotifications'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        saveSettings();
        showToast('Setting updated!', 'success');
    });
});

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('settingsName').value.trim();
    
    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }
    
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update display
    if (adminName) adminName.textContent = name;
    
    showToast('Profile updated successfully!', 'success');
});

// Password form submission
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    // In a real app, this would call the API
    showToast('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
});

// Contact form submission
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
    showToast('Contact information saved!', 'success');
});

// Delete all products
document.getElementById('deleteAllProducts').addEventListener('click', async () => {
    const confirmed = confirm('⚠️ WARNING: This will delete ALL products permanently!\n\nAre you absolutely sure you want to continue?');
    
    if (!confirmed) return;
    
    const doubleConfirm = prompt('Type "DELETE ALL" to confirm:');
    
    if (doubleConfirm !== 'DELETE ALL') {
        showToast('Deletion cancelled', 'info');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Fetch all products
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        // Delete each product
        for (const product of products) {
            await fetch(`${API_URL}/products/${product._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        showToast('All products deleted!', 'success');
    } catch (error) {
        console.error('Error deleting products:', error);
        showToast('Failed to delete products', 'error');
    }
});

// Toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-gray-800 text-white'
    }`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);