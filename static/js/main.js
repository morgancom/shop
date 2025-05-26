/**
 * Modern E-Shop - Main JavaScript File
 * Contains all the interactive functionality for the e-commerce template
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== MOBILE MENU TOGGLE ==========
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('show');
            mobileMenuOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        closeMobileMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('show');
            mobileMenuOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });

        mobileMenuOverlay.addEventListener('click', function() {
            mobileMenu.classList.remove('show');
            mobileMenuOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Mobile dropdown menus
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const submenu = this.nextElementSibling;
            submenu.classList.toggle('show');
            this.querySelector('i').classList.toggle('fa-chevron-up');
            this.querySelector('i').classList.toggle('fa-chevron-down');
        });
    });

    // ========== USER DROPDOWN MENU ==========
    const userDropdownToggle = document.querySelector('.dropdown-toggle');
    const userDropdownMenu = document.querySelector('.dropdown-menu');

    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
            this.setAttribute('aria-expanded', userDropdownMenu.classList.contains('show'));
        });

        // Close when clicking outside
        document.addEventListener('click', function() {
            userDropdownMenu.classList.remove('show');
            userDropdownToggle.setAttribute('aria-expanded', 'false');
        });
    }

    // ========== PROMO BANNER CLOSE ==========
    const closeBanner = document.querySelector('.close-banner');
    const promoBanner = document.querySelector('.promo-banner');

    if (closeBanner && promoBanner) {
        closeBanner.addEventListener('click', function() {
            promoBanner.style.display = 'none';
            // You might want to set a cookie here to remember the closed state
        });
    }

    // ========== FLASH MESSAGE HANDLING ==========
    const closeAlertButtons = document.querySelectorAll('.close-alert');
    closeAlertButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alert = this.closest('.alert');
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => alert.remove(), 300);
        });
    });

    // Auto-close alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });

    // ========== BACK TO TOP BUTTON ==========
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== CURRENT YEAR IN FOOTER ==========
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // ========== SEARCH FUNCTIONALITY ==========
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[name="q"]');
            const categorySelect = this.querySelector('select[name="category"]');
            
            if (searchInput.value.trim() === '' && categorySelect.value === '') {
                searchInput.focus();
                return;
            }
            
            // In a real implementation, this would submit the form
            console.log('Searching for:', searchInput.value, 'in category:', categorySelect.value);
            // this.submit();
        });
    }

    // ========== NEWSLETTER FORM ==========
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (!emailInput.value || !isValidEmail(emailInput.value)) {
                emailInput.focus();
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            showAlert('Thank you for subscribing!', 'success');
            emailInput.value = '';
            
            // In a real implementation, you would send this to your server
            // console.log('Subscribed email:', emailInput.value);
        });
    }

    // ========== HELPER FUNCTIONS ==========
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.setAttribute('role', 'alert');
        alert.innerHTML = `
            ${message}
            <button class="close-alert" aria-label="Close message">&times;</button>
        `;
        
        document.body.appendChild(alert);
        
        // Add animation
        alert.style.animation = 'slideIn 0.3s ease forwards';
        
        // Add close functionality
        const closeButton = alert.querySelector('.close-alert');
        closeButton.addEventListener('click', function() {
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => alert.remove(), 300);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    // ========== LAZY LOADING IMAGES ==========
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading is supported
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyScript = document.createElement('script');
        lazyScript.src = 'https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js';
        document.body.appendChild(lazyScript);
        
        lazyScript.onload = function() {
            const observer = lozad();
            observer.observe();
        };
    }

    // ========== ANIMATIONS ==========
    // Initialize animations when elements come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('[data-aos]');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('aos-animate');
            } else {
                element.classList.remove('aos-animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load

    // Device detection and optimization
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Touch event handlers
    if (isTouch) {
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
    }

    let xDown = null;
    let yDown = null;

    function handleTouchStart(evt) {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
    }

    function handleTouchMove(evt) {
        if (!xDown || !yDown) return;

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                // Left swipe
                handleSwipeLeft();
            } else {
                // Right swipe
                handleSwipeRight();
            }
        }

        xDown = null;
        yDown = null;
    }

    function handleSwipeLeft() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    function handleSwipeRight() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('show')) {
            mobileMenu.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // Responsive image loading
    function loadResponsiveImages() {
        const images = document.querySelectorAll('img[data-src]');
        const screenWidth = window.innerWidth;
        
        images.forEach(img => {
            const src = img.dataset.src;
            if (src) {
                // Choose appropriate image size based on screen width
                const size = screenWidth < 768 ? 'small' : 
                            screenWidth < 1200 ? 'medium' : 'large';
                img.src = src.replace('[size]', size);
                img.removeAttribute('data-src');
            }
        });
    }

    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                // Handle scroll events
                handleScroll();
            }, 66); // 15fps
        }
    }, { passive: true });

    // Responsive menu handling
    function initResponsiveMenu() {
        const menu = document.querySelector('.nav-menu');
        if (menu) {
            if (window.innerWidth < 768) {
                menu.setAttribute('role', 'menu');
                menu.setAttribute('aria-orientation', 'vertical');
            } else {
                menu.setAttribute('role', 'menubar');
                menu.setAttribute('aria-orientation', 'horizontal');
            }
        }
    }

    // Initialize responsive features
    window.addEventListener('DOMContentLoaded', () => {
        initResponsiveMenu();
        loadResponsiveImages();
    });

    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            initResponsiveMenu();
            loadResponsiveImages();
        }, 250);
    });

    // ========== CART DROPDOWN TOGGLE ==========
    initializeCartDropdown();

    function initializeCartDropdown() {
        const cartButton = document.querySelector('.cart-button');
        const cartDropdown = document.querySelector('.cart-dropdown');

        if (cartButton && cartDropdown) {
            cartButton.addEventListener('click', function (e) {
                e.stopPropagation();
                cartDropdown.classList.toggle('show');
            });

            document.addEventListener('click', function () {
                cartDropdown.classList.remove('show');
            });
        }
    }

    // ========== SMOOTH SCROLL ==========
    initializeSmoothScroll();

    function initializeSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ========== CONTACT FORM VALIDATION ==========
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                e.preventDefault();
                alert('Please fill out all fields before submitting.');
            }
        });
    }
});

// ========== CART COUNT UPDATER ==========
// This would typically be called when items are added/removed from cart
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        if (count > 0) {
            cartCount.removeAttribute('hidden');
        } else {
            cartCount.setAttribute('hidden', 'true');
        }
    }
}

// Example usage:
// updateCartCount(5);

// ========== PRODUCT QUICK VIEW ==========
function showQuickView(productId) {
    // In a real implementation, this would fetch product data and display a modal
    console.log('Showing quick view for product:', productId);
    // Example:
    // fetch(`/api/products/${productId}/quick-view`)
    //     .then(response => response.json())
    //     .then(data => {
    //         // Display modal with product data
    //     });
}

// Add event listeners for quick view buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.quick-view-btn')) {
        const productId = e.target.closest('.quick-view-btn').dataset.productId;
        showQuickView(productId);
    }
});

// Cart Functionality
document.addEventListener('click', function(e) {
    // Add to Cart Button Click
    if (e.target.closest('.add-to-cart')) {
        e.preventDefault();
        const button = e.target.closest('.add-to-cart');
        const productId = button.dataset.productId;
        const quantity = 1; // Default quantity, can be modified for variable quantities
        
        addToCart(productId, quantity, button);
    }
    
    // Update Cart Quantity
    if (e.target.matches('.cart-quantity-input')) {
        const input = e.target;
        const itemId = input.dataset.itemId;
        
        input.addEventListener('change', function() {
            updateCartItem(itemId, this.value);
        });
    }
});

async function addToCart(productId, quantity, button) {
    button.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('quantity', quantity);
        
        const response = await fetch('/cart/add', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update cart count in header
            const cartCount = document.querySelector('.cart-count');
            cartCount.textContent = data.cart_count;
            cartCount.style.display = 'flex';
            
            showAlert('Product added to cart', 'success');
        } else {
            showAlert(data.error || 'Failed to add product to cart', 'error');
        }
    } catch (error) {
        showAlert('An error occurred', 'error');
        console.error('Error:', error);
    } finally {
        button.disabled = false;
    }
}

async function updateCartItem(itemId, quantity) {
    try {
        const formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('quantity', quantity);
        
        const response = await fetch('/cart/update', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update cart count and subtotal
            document.querySelector('.cart-count').textContent = data.cart_count;
            document.querySelector('.cart-subtotal').textContent = data.subtotal;
            
            if (quantity <= 0) {
                // Remove item row if quantity is 0
                const itemRow = document.querySelector(`[data-item-id="${itemId}"]`).closest('tr');
                itemRow.remove();
                
                if (data.cart_count === 0) {
                    location.reload(); // Reload if cart is empty
                }
            }
        } else {
            showAlert(data.error || 'Failed to update cart', 'error');
        }
    } catch (error) {
        showAlert('An error occurred', 'error');
        console.error('Error:', error);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Close flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
        
        message.addEventListener('click', () => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        });
    });
    
    // Dropdown menus
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.nextElementSibling;
            const isOpen = menu.style.opacity === '1';
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) {
                    m.style.opacity = '0';
                    m.style.visibility = 'hidden';
                    m.style.transform = 'translateY(10px)';
                }
            });
            
            if (isOpen) {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(10px)';
            } else {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(10px)';
        });
    });
    
    // Prevent dropdown from closing when clicking inside
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Cart count update
    function updateCartCount(count) {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            if (count > 0) {
                cartCount.textContent = count;
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }
    
    // Example of updating cart count (you would replace this with your actual logic)
    // updateCartCount(3);
    
    // You might want to add an event listener for cart updates
    // For example, if you're using AJAX to add items to cart
    document.addEventListener('cartUpdated', function(e) {
        updateCartCount(e.detail.count);
    });
});