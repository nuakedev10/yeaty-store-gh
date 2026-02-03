// admin/js/login.js

const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
    
    try {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('Attempting login with:', email); // Debug
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data); // Debug
        
        if (response.ok && data.token) {
            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Verify it was saved
            console.log('✅ Token saved:', localStorage.getItem('token'));
            console.log('✅ User saved:', localStorage.getItem('user'));
            
            alert('✅ Login successful!');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert(`❌ ${data.message || 'Login failed'}`);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Login failed. Please check console for details.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});