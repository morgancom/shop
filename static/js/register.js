document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Password visibility toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updateStrengthIndicator(strength);
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        let isValid = true;

        // Name validation
        if (name.length < 2) {
            showError('name', 'Name must be at least 2 characters long');
            isValid = false;
        } else {
            removeError('name');
        }

        // Email validation
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            removeError('email');
        }

        // Password validation
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters long');
            isValid = false;
        } else {
            removeError('password');
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});

function checkPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains number
    if (/\d/.test(password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;

    return strength;
}

function updateStrengthIndicator(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) {
        strengthBar.className = 'strength-bar weak';
        strengthText.textContent = 'Weak';
    } else if (strength <= 50) {
        strengthBar.className = 'strength-bar fair';
        strengthText.textContent = 'Fair';
    } else if (strength <= 75) {
        strengthBar.className = 'strength-bar good';
        strengthText.textContent = 'Good';
    } else {
        strengthBar.className = 'strength-bar strong';
        strengthText.textContent = 'Strong';
    }
}

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