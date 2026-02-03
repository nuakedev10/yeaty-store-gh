// admin/js/add-product.js

const API_URL = 'http://localhost:5000/api';
let selectedFiles = [];

// Handle file selection and preview
document.getElementById('productImages').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    selectedFiles = files; // Store files
    
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = ''; // Clear previous previews
    
    if (files.length > 0) {
        preview.classList.remove('hidden');
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'relative';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="w-full h-32 object-cover rounded-lg border-2 border-gray-300">
                    <button type="button" onclick="removeImage(${index})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                    <p class="text-xs text-gray-600 mt-1 truncate">${file.name}</p>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Remove image from selection
window.removeImage = function(index) {
    selectedFiles.splice(index, 1);
    
    // Trigger change event to update preview
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    document.getElementById('productImages').files = dataTransfer.files;
    
    // Update preview
    document.getElementById('productImages').dispatchEvent(new Event('change'));
};

// Handle form submission
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding Product...';
    
    try {
        // Get form values
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const category = document.getElementById('productCategory').value;
        const price = document.getElementById('productPrice').value;
        const checkoutLink = document.getElementById('checkoutLink').value.trim();
        const inStock = document.getElementById('productInStock').checked;
        const featured = document.getElementById('productFeatured').checked;
        
        // Validate
        if (!name || !description || !category || !price || !checkoutLink) {
            alert('Please fill in all required fields');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (description.length < 20) {
            alert('Description must be at least 20 characters');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (selectedFiles.length === 0) {
            alert('Please select at least one product image');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Create FormData
        const formData = new FormData();
        
        // Append text fields FIRST (important!)
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('checkoutLink', checkoutLink);
        formData.append('inStock', inStock);
        formData.append('featured', featured);
        
        // Append files LAST - Important: append each file individually with the same field name
        selectedFiles.forEach(file => {
            formData.append('images', file); // Use 'images' (matches backend)
        });
        
        // Log for debugging
        console.log('Sending product data:');
        console.log('- Name:', name);
        console.log('- Files:', selectedFiles.length);
        
        // Get token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = 'login.html';
            return;
        }
        
        // Send request
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // DON'T set Content-Type - browser will set it with boundary
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success!
            alert('✅ Product added successfully!');
            console.log('Created product:', data);
            
            // Redirect to products page
            window.location.href = 'products.html';
        } else {
            // Error from server
            console.error('Server error:', data);
            alert(`❌ Error: ${data.message || 'Failed to add product'}`);
        }
        
    } catch (error) {
        console.error('Error adding product:', error);
        alert('❌ Failed to add product. Please check console for details.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Sidebar toggle for mobile
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.toggle('hidden');
});

document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
});

// Profile menu toggle
document.getElementById('profileBtn')?.addEventListener('click', () => {
    document.getElementById('profileMenu').classList.toggle('hidden');
});

// Close profile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#profileBtn') && !e.target.closest('#profileMenu')) {
        document.getElementById('profileMenu')?.classList.add('hidden');
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});