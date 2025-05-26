document.addEventListener('DOMContentLoaded', function() {
    // Payment method tabs
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-content');
    
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            paymentTabs.forEach(t => t.classList.remove('active'));
            paymentContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Format credit card number
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\s+/g, ''); // Remove all spaces
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join(' '); // Add space every 4 digits
            }
            this.value = value;
        });
    }
    
    // Format expiry date
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
    
    // Copy crypto address
    if (typeof ClipboardJS !== 'undefined') {
        new ClipboardJS('.copy-btn');
        
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    }
    
    // Update crypto address based on selection
    const cryptoOptions = document.querySelectorAll('.crypto-option input');
    cryptoOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                const walletAddress = getWalletAddress(this.value);
                document.getElementById('wallet-address').textContent = walletAddress;
            }
        });
    });
    
    // Coupon code application
    const applyCouponBtn = document.querySelector('.apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            const couponCode = document.getElementById('coupon').value;
            if (couponCode) {
                // Here you would typically make an AJAX call to validate the coupon
                alert(`Coupon code "${couponCode}" applied successfully!`);
            } else {
                alert('Please enter a coupon code');
            }
        });
    }
    
    // Form validation
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            const agreeTerms = document.getElementById('agreeTerms');
            if (!agreeTerms.checked) {
                e.preventDefault();
                alert('Please agree to the terms and conditions');
                return false;
            }
            
            // Additional validation can be added here
            return true;
        });
    }
    
    // Helper function to get wallet address (simulated)
    function getWalletAddress(cryptoType) {
        const addresses = {
            'bitcoin': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            'ethereum': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            'litecoin': 'LSN5D48waHCyTJVVzQYt7fF2K9K8JvE3H1'
        };
        return addresses[cryptoType] || '';
    }
    
    // Initialize Stripe (if using Stripe for payments)
    if (typeof Stripe !== 'undefined') {
        const stripe = Stripe('your_publishable_key');
        // Stripe elements initialization would go here
    }
});