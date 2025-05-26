document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const email = document.getElementById('email').value;
            let isValid = true;

            // Email validation
            if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                removeError('email');
            }

            if (!isValid) {
                e.preventDefault();
            } else {
                const submitBtn = this.querySelector('button[type="submit"]');
                setLoadingState(submitBtn, true);
            }
        });
    }
});

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

function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        button.innerHTML = originalText;
    }
}