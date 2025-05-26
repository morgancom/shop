document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Form validation
    const loginForm = document.querySelector('.auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            let isValid = true;

            // Simple email validation
            if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                removeError('email');
            }

            // Password validation
            if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                removeError('password');
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Social login buttons
    const socialButtons = document.querySelectorAll('.social-login button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('google-login') ? 'Google' : 'Facebook';
            // Implement social login logic here
            console.log(`Logging in with ${provider}`);
        });
    });
});

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorDiv = field.parentElement.querySelector('.field-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        field.parentElement.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    field.classList.add('error');
}

function removeError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.parentElement.querySelector('.field-error');
    
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

// Add loading state to buttons
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        button.innerHTML = originalText;
    }
}