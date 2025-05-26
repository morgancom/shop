document.addEventListener('DOMContentLoaded', function() {
    initializeDataTables();
    initializeCharts();
    initializeDeleteConfirmation();
    initializeImagePreview();
});

function initializeDataTables() {
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        new simpleDatatables.DataTable(table, {
            searchable: true,
            sortable: true,
            perPage: 10
        });
    });
}

function initializeCharts() {
    const salesChart = document.getElementById('salesChart');
    if (salesChart) {
        new Chart(salesChart, {
            type: 'line',
            data: {
                labels: lastSevenDays(),
                datasets: [{
                    label: 'Sales',
                    data: salesData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function initializeDeleteConfirmation() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = this.dataset.id;
            const itemType = this.dataset.type;
            
            if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
                deleteItem(itemId, itemType, this);
            }
        });
    });
}

function deleteItem(id, type, button) {
    fetch(`/admin/${type}/delete/${id}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            button.closest('tr').remove();
            showNotification('Item deleted successfully', 'success');
        } else {
            showNotification('Failed to delete item', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred', 'error');
    });
}

function initializeImagePreview() {
    const imageInput = document.querySelector('input[type="file"]');
    const preview = document.querySelector('.image-preview');
    
    if (imageInput && preview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function lastSevenDays() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString());
    }
    return dates;
}
