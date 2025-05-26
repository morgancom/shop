/**
 * Products Page JavaScript
 * Handles all product listing page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== MOBILE FILTERS TOGGLE ==========
    const mobileFiltersToggle = document.querySelector('.mobile-filters-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const mobileFiltersOverlay = document.createElement('div');
    mobileFiltersOverlay.className = 'mobile-filters-overlay';
    
    if (mobileFiltersToggle && filtersSidebar) {
        mobileFiltersToggle.addEventListener('click', function() {
            filtersSidebar.classList.add('active');
            document.body.appendChild(mobileFiltersOverlay);
            document.body.style.overflow = 'hidden';
        });
        
        mobileFiltersOverlay.addEventListener('click', function() {
            filtersSidebar.classList.remove('active');
            document.body.removeChild(mobileFiltersOverlay);
            document.body.style.overflow = '';
        });
    }

    // ========== PRICE RANGE SLIDER ==========
    const priceSlider = document.getElementById