// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    initializeCart();
    initializeSearch();
    initializeAnimations();
});

// UI Initialization
function initializeUI() {
    // Initialize dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.nextElementSibling;
            menu.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (!menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    });

    // Initialize tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.dataset.tooltip;
        
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            positionTooltip(tooltip, element);
        });

        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
    });
}

// Cart Functions
function initializeCart() {
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            const quantity = document.querySelector('#quantity')?.value || 1;

            try {
                const response = await fetch('/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ product_id: productId, quantity })
                });
                
                const data = await response.json();
                if (data.success) {
                    showNotification('Product added to cart!', 'success');
                    updateCartCount();
                } else {
                    showNotification(data.error || 'Failed to add product', 'error');
                }
            } catch (error) {
                showNotification('An error occurred', 'error');
                console.error('Error:', error);
            }
        });
    });

    // Update cart count on page load
    updateCartCount();
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = this.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            }
        }, 300);
    });
}

// Animation Functions
function initializeAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} slide-in`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    notification.querySelector('.notification-close').onclick = () => {
        notification.remove();
    };
}

async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count');
        const data = await response.json();
        document.querySelector('.cart-count').textContent = data.count;
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

async function performSearch(query) {
    try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        updateSearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function updateSearchResults(results) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = results.length ? 
        results.map(result => `
            <a href="/product/${result.id}" class="search-result-item">
                <img src="/static/images/${result.image}" alt="${result.name}">
                <div class="result-details">
                    <h4>${result.name}</h4>
                    <p class="price">$${result.price.toFixed(2)}</p>
                </div>
            </a>
        `).join('') :
        '<div class="no-results">No products found</div>';
}

// Export utilities for use in other scripts
window.app = {
    showNotification,
    updateCartCount,
    performSearch
};
