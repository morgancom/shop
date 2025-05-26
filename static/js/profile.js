document.addEventListener('DOMContentLoaded', function() {
    initializeAvatarUpload();
    initializeFormValidation();
    handleProfileUpdates();
});

function initializeAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.querySelector('.profile-avatar');
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}

function initializeFormValidation() {
    const form = document.querySelector('.profile-form');
    
    form.addEventListener('submit', function(e) {
        const phone = document.getElementById('phone').value;
        
        // Basic phone validation
        if (phone && !validatePhone(phone)) {
            e.preventDefault();
            showError('phone', 'Please enter a valid phone number');
        }
        
        // URL validations
        const urls = ['website', 'facebook', 'twitter', 'instagram', 'linkedin'];
        urls.forEach(id => {
            const input = document.getElementById(id);
            if (input.value && !validateUrl(input.value)) {
                e.preventDefault();
                showError(id, 'Please enter a valid URL');
            }
        });
    });
}

function validatePhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorDiv = field.parentElement.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        field.parentElement.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    field.classList.add('error');
}

function handleProfileUpdates() {
    // Handle avatar upload
    const avatarButton = document.querySelector('.edit-avatar');
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.style.display = 'none';
    document.body.appendChild(avatarInput);

    if (avatarButton) {
        avatarButton.addEventListener('click', () => avatarInput.click());
    }

    avatarInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const formData = new FormData();
            formData.append('avatar', this.files[0]);
            uploadImage(formData);
        }
    });

    // Handle cover upload
    const coverButton = document.querySelector('.edit-cover');
    const coverInput = document.createElement('input');
    coverInput.type = 'file';
    coverInput.accept = 'image/*';
    coverInput.style.display = 'none';
    document.body.appendChild(coverInput);

    if (coverButton) {
        coverButton.addEventListener('click', () => coverInput.click());
    }

    coverInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const formData = new FormData();
            formData.append('cover', this.files[0]);
            uploadImage(formData);
        }
    });

    // Handle form submission
    const profileForm = document.querySelector('.settings-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            updateProfile(formData);
        });
    }
}

async function uploadImage(formData) {
    try {
        const response = await fetch('/profile/edit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
            location.reload();
        } else {
            throw new Error(data.error || 'Failed to upload image');
        }
    } catch (error) {
        alert('Error uploading image: ' + error.message);
    }
}

async function updateProfile(formData) {
    try {
        const response = await fetch('/profile/edit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
            location.reload();
        } else {
            throw new Error(data.error || 'Failed to update profile');
        }
    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
}
