// API Base URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const productImages = document.getElementById('productImages');
const imagePreview = document.getElementById('imagePreview');
const submitBtn = document.getElementById('submitBtn');

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

// Close profile menu when clicking outside
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

// Image preview functionality
let selectedFiles = [];

productImages.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length > 5) {
        alert('You can only upload up to 5 images');
        return;
    }
    
    selectedFiles = files;
    displayImagePreviews(files);
});

function displayImagePreviews(files) {
    imagePreview.innerHTML = '';
    imagePreview.classList.remove('hidden');
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'relative group';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}" class="w-full h-24 object-cover rounded-lg border-2 border-gray-200">
                <button type="button" onclick="removeImage(${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-times"></i>
                </button>
                ${index === 0 ? '<span class="absolute bottom-1 left-1 bg-yeaty-blue text-white text-xs px-2 py-0.5 rounded">Main</span>' : ''}
            `;
            imagePreview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    
    // Update the file input
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    productImages.files = dt.files;
    
    if (selectedFiles.length === 0) {
        imagePreview.classList.add('hidden');
    } else {
        displayImagePreviews(selectedFiles);
    }
}

// Form submission
addProductForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    
    // Validate form
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const checkoutLink = document.getElementById('checkoutLink').value.trim();
    const inStock = document.getElementById('productInStock').checked;
    const featured = document.getElementById('productFeatured').checked;
    
    if (!name || !description || !category || !price || !checkoutLink) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (description.length < 20) {
        alert('Description must be at least 20 characters');
        return;
    }
    
    // Validate checkout link is a valid URL
    try {
        new URL(checkoutLink);
    } catch (err) {
        alert('Please enter a valid checkout URL');
        return;
    }
    
    if (selectedFiles.length === 0) {
        alert('Please upload at least one product image');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding Product...';
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('checkoutLink', checkoutLink);
        formData.append('inStock', inStock);
        formData.append('featured', featured);
        
        // Append images
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });
        
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Product added successfully!');
            window.location.href = 'products.html';
        } else {
            throw new Error(data.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert(error.message || 'Failed to add product. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Product';
    }
});