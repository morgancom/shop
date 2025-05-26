document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const togglePassword = document.querySelector('.toggle-password');

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
        const strength = checkPasswordStrength(this.value);
        updateStrengthIndicator(strength);
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;

        // Password validation
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters long');
            isValid = false;
        } else {
            removeError('password');
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            showError('confirm_password', 'Passwords do not match');
            isValid = false;
        } else {
            removeError('confirm_password');
        }

        if (!isValid) {
            e.preventDefault();
        } else {
            const submitBtn = this.querySelector('button[type="submit"]');
            setLoadingState(submitBtn, true);
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