// API Base URL
const API_URL = 'http://localhost:5000/api';

// Create product card HTML
function createProductCard(product) {
    const imageUrl = product.images && product.images.length > 0 
        ? `${API_URL.replace('/api', '')}${product.images[0]}` 
        : 'https://via.placeholder.com/300x300?text=No+Image';
    
    const stockBadge = product.inStock 
        ? '<span class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">In Stock</span>'
        : '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>';
    
    const featuredBadge = product.featured 
        ? '<span class="absolute top-2 left-2 bg-yeaty-yellow text-gray-900 text-xs px-2 py-1 rounded-full font-semibold"><i class="fas fa-star mr-1"></i>Featured</span>'
        : '';

    // Use checkout link for Buy Now button
    const buyNowButton = product.checkoutLink && product.inStock
        ? `<a href="${product.checkoutLink}" target="_blank" rel="noopener noreferrer" class="flex-1 bg-yeaty-yellow text-gray-900 py-2 rounded-lg hover:bg-yellow-500 transition font-semibold text-center">
               <i class="fas fa-shopping-cart mr-2"></i>Buy Now
           </a>`
        : `<button disabled class="flex-1 bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed font-semibold">
               <i class="fas fa-times-circle mr-2"></i>${product.inStock ? 'No Link' : 'Out of Stock'}
           </button>`;

    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div class="relative">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover"
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                ${stockBadge}
                ${featuredBadge}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <span class="text-xs text-yeaty-blue font-semibold uppercase tracking-wide">${product.category}</span>
                <h3 class="font-bold text-lg text-gray-800 mt-1 mb-2 line-clamp-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">${product.description}</p>
                <div class="mt-auto">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-2xl font-bold text-yeaty-blue">GH₵${product.price.toFixed(2)}</span>
                    </div>
                    <div class="flex gap-2">
                        <a href="product-detail.html?id=${product._id}" class="flex-1 bg-yeaty-blue text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-center">
                            <i class="fas fa-eye mr-2"></i>View
                        </a>
                        ${buyNowButton}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load featured products on homepage
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/products?featured=true&limit=8`);
        const products = await response.json();
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No featured products yet. Check back soon!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-gray-600">Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

// Load all products on products page
async function loadAllProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    // Get category from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    let url = `${API_URL}/products`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        const products = await response.json();
        
        // Update page title if category is selected
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && category) {
            pageTitle.textContent = category;
        }
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No products found${category ? ' in ' + category : ''}.</p>
                    <a href="products.html" class="text-yeaty-blue hover:underline mt-2 inline-block">View all products</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-gray-600">Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    loadAllProducts();
});