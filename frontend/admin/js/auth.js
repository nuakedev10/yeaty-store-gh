// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const currentPage = window.location.pathname;
    
    if (!token && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (token && currentPage.includes('login.html')) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    // Display admin name
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const adminNameEl = document.getElementById('adminName');
    const welcomeNameEl = document.getElementById('welcomeName');
    
    if (adminNameEl) adminNameEl.textContent = user.name || 'Admin';
    if (welcomeNameEl) welcomeNameEl.textContent = user.name || 'Admin';
    
    return true;
}

// Get authorization headers
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Handle unauthorized responses
function handleUnauthorized(response) {
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
        return true;
    }
    return false;
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});