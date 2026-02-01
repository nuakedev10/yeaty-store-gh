const API_URL = 'http://localhost:5000/api';

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: getAuthHeaders()
        });
        
        if (handleUnauthorized(response)) return;
        
        const products = await response.json();
        
        // Calculate statistics
        const totalProducts = products.length;
        const inStock = products.filter(p => p.inStock).length;
        const outOfStock = products.filter(p => !p.inStock).length;
        const featured = products.filter(p => p.featured).length;
        
        // Update UI
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('inStock').textContent = inStock;
        document.getElementById('outOfStock').textContent = outOfStock;
        document.getElementById('featured').textContent = featured;
        
        // Load recent products (last 5)
        loadRecentProducts(products.slice(0, 5));
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent products
function loadRecentProducts(products) {
    const tableBody = document.getElementById('recentProductsTable');
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No products found. <a href="add-product.html" class="text-yeaty-blue hover:underline">Add your first product</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${API_URL.replace('/api', '')}${product.images[0]}" 
                         alt="${product.name}" 
                         class="w-10 h-10 rounded object-cover mr-3"
                         onerror="this.src='https://via.placeholder.com/40'">
                    <div class="text-sm font-medium text-gray-900">${truncateText(product.name, 30)}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600">${getCategoryShortName(product.category)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">GH₵ ${parseFloat(product.price).toFixed(2)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <a href="edit-product.html?id=${product._id}" class="text-yeaty-blue hover:text-blue-700 mr-3">
                    <i class="fas fa-edit"></i>
                </a>
                <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (handleUnauthorized(response)) return;
        
        if (response.ok) {
            alert('Product deleted successfully!');
            loadDashboardStats();
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// Utility functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function getCategoryShortName(category) {
    const shortNames = {
        'Tech Essentials Ghana': 'Tech',
        'Fitness & Wellness Ghana': 'Fitness',
        'Fashion Ghana': 'Fashion'
    };
    return shortNames[category] || category;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadDashboardStats();
    }
});