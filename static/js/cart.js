document.addEventListener('DOMContentLoaded', function() {
    initializeQuantityControls();
    initializeRemoveButtons();
    updateCartTotals();
});

function initializeQuantityControls() {
    document.querySelectorAll('.cart-item').forEach(item => {
        const minusBtn = item.querySelector('.qty-btn.minus');
        const plusBtn = item.querySelector('.qty-btn.plus');
        const input = item.querySelector('input');
        const productId = item.dataset.id;

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                updateQuantity(productId, currentValue - 1);
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue < 99) {
                input.value = currentValue + 1;
                updateQuantity(productId, currentValue + 1);
            }
        });

        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (value < 1) value = 1;
            if (value > 99) value = 99;
            this.value = value;
            updateQuantity(productId, value);
        });
    });
}

function initializeRemoveButtons() {
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const productId = item.dataset.id;
            
            if (confirm('Are you sure you want to remove this item?')) {
                removeFromCart(productId, item);
            }
        });
    });
}

function updateQuantity(productId, quantity) {
    fetch('/cart/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartTotals();
            updateItemTotal(productId, data.item_total);
        } else {
            showNotification('Failed to update quantity.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred.', 'error');
    });
}

function removeFromCart(productId, itemElement) {
    fetch('/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            itemElement.remove();
            updateCartTotals();
            updateCartCount();
            
            // Check if cart is empty
            if (document.querySelectorAll('.cart-item').length === 0) {
                location.reload(); // Reload to show empty cart message
            }
        } else {
            showNotification('Failed to remove item.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred.', 'error');
    });
}

function updateCartTotals() {
    fetch('/cart/totals')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.summary-row:nth-child(1) span:last-child').textContent = 
                `$${data.subtotal.toFixed(2)}`;
            document.querySelector('.summary-row:nth-child(2) span:last-child').textContent = 
                `$${data.shipping.toFixed(2)}`;
            document.querySelector('.summary-row:nth-child(3) span:last-child').textContent = 
                `$${data.tax.toFixed(2)}`;
            document.querySelector('.summary-total span:last-child').textContent = 
                `$${data.total.toFixed(2)}`;
        })
        .catch(error => console.error('Error:', error));
}

function updateItemTotal(productId, total) {
    const item = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (item) {
        item.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);

    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
}