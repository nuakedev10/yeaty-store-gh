const API_URL = 'http://localhost:5000/api';
let currentProduct = null;
let imagesToDelete = [];
let newFiles = [];

// Get product ID from URL
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load product data
async function loadProduct() {
    const productId = getProductId();
    
    if (!productId) {
        alert('Product ID not found');
        window.location.href = 'products.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        currentProduct = product;
        
        populateForm(product);
        displayCurrentImages(product.images);
        
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('editProductForm').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Failed to load product');
        window.location.href = 'products.html';
    }
}

// Populate form with product data
function populateForm(product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productInStock').checked = product.inStock;
    document.getElementById('productFeatured').checked = product.featured || false;
}

// Display current images
function displayCurrentImages(images) {
    const container = document.getElementById('currentImages');
    container.innerHTML = '';
    
    if (!images || images.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No images available</p>';
        return;
    }
    
    images.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'relative group';
        div.innerHTML = `
            <img src="${API_URL}${image}" 
                 alt="Product ${index + 1}" 
                 class="w-full h-24 object-cover rounded-lg border-2 border-gray-200">
            <button type="button" 
                    onclick="markImageForDeletion('${image}', this)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                <i class="fas fa-times text-xs"></i>
            </button>
            <div class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                ${index === 0 ? 'Main' : index + 1}
            </div>
        `;
        container.appendChild(div);
    });
}

// Mark image for deletion
window.markImageForDeletion = function(imagePath, button) {
    if (confirm('Delete this image?')) {
        imagesToDelete.push(imagePath);
        button.closest('.relative').remove();
        
        // Check if container is empty
        const container = document.getElementById('currentImages');
        if (container.children.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No images available</p>';
        }
    }
};

// Handle new image uploads
document.getElementById('newImages')?.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    const currentImagesCount = document.getElementById('currentImages').querySelectorAll('img').length;
    const totalImages = currentImagesCount - imagesToDelete.length + files.length;
    
    if (totalImages > 5) {
        alert('Maximum 5 images allowed in total');
        e.target.value = '';
        return;
    }
    
    newFiles = files;
    displayNewImagePreviews(files);
});

function displayNewImagePreviews(files) {
    const previewContainer = document.getElementById('newImagePreview');
    
    if (files.length === 0) {
        previewContainer.classList.add('hidden');
        return;
    }
    
    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'relative group';
            div.innerHTML = `
                <img src="${e.target.result}" 
                     alt="New ${index + 1}" 
                     class="w-full h-24 object-cover rounded-lg border-2 border-green-200">
                <button type="button" 
                        onclick="removeNewImage(${index})"
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-times text-xs"></i>
                </button>
                <div class="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    New
                </div>
            `;
            previewContainer.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
}

window.removeNewImage = function(index) {
    newFiles.splice(index, 1);
    
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    document.getElementById('newImages').files = dataTransfer.files;
    
    displayNewImagePreviews(newFiles);
};

// Handle form submission
document.getElementById('editProductForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Validate
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    
    if (!name || !description || !category || !price) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (description.length < 20) {
        alert('Description must be at least 20 characters');
        return;
    }
    
    if (parseFloat(price) <= 0) {
        alert('Price must be greater than 0');
        return;
    }
    
    // Check if at least one image remains
    const remainingCurrentImages = currentProduct.images.length - imagesToDelete.length;
    const totalImages = remainingCurrentImages + newFiles.length;
    
    if (totalImages === 0) {
        alert('Product must have at least one image');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('inStock', document.getElementById('productInStock').checked);
        formData.append('featured', document.getElementById('productFeatured').checked);
        
        // Add images to delete
        if (imagesToDelete.length > 0) {
            formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
        }
        
        // Add new images
        for (let i = 0; i < newFiles.length; i++) {
            formData.append('images', newFiles[i]);
        }
        
        // Send request
        const response = await fetch(`${API_URL}/products/${getProductId()}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        if (handleUnauthorized(response)) return;
        
        if (response.ok) {
            alert('Product updated successfully!');
            window.location.href = 'products.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    loadProduct();
    
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    });
    
    sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });
    
    // Profile menu
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    profileBtn?.addEventListener('click', () => {
        profileMenu.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        }
    });
});