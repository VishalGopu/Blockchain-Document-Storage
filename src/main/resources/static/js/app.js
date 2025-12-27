// Document Management System - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeFileUpload();
    initializeFormValidation();
    initializeAlerts();
    initializeTables();
    initializeModals();
});

// File Upload Handler
function initializeFileUpload() {
    const uploadArea = document.querySelector('.file-upload-area');
    const fileInput = document.querySelector('#documentFile');
    
    if (!uploadArea || !fileInput) return;

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            displaySelectedFile(files[0]);
        }
    });

    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            displaySelectedFile(e.target.files[0]);
        }
    });
}

function displaySelectedFile(file) {
    const uploadArea = document.querySelector('.file-upload-area');
    const fileInfo = document.createElement('div');
    fileInfo.className = 'selected-file-info mt-3';
    
    // Remove previous file info
    const existingInfo = uploadArea.querySelector('.selected-file-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    fileInfo.innerHTML = `
        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
            <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <div>
                    <div class="font-medium text-gray-900">${file.name}</div>
                    <div class="text-sm text-gray-500">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="text-red-500 hover:text-red-700" onclick="clearSelectedFile()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    uploadArea.appendChild(fileInfo);
}

function clearSelectedFile() {
    const fileInput = document.querySelector('#documentFile');
    const fileInfo = document.querySelector('.selected-file-info');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.remove();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(field)} is required`);
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Password validation
    if (field.type === 'password' && value) {
        if (value.length < 6) {
            showFieldError(field, 'Password must be at least 6 characters long');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-500 text-sm mt-1';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    return field.name || field.id || 'Field';
}

// Alert System
function initializeAlerts() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            hideAlert(alert);
        }, 5000);
    });
}

function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.alert-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="flex justify-between items-center">
            <span>${message}</span>
            <button onclick="hideAlert(this.parentNode.parentNode)" class="text-xl font-bold">&times;</button>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-hide after 5 seconds
    setTimeout(() => hideAlert(alert), 5000);
}

function hideAlert(alert) {
    if (alert && alert.parentNode) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container fixed top-4 right-4 z-50';
    document.body.appendChild(container);
    return container;
}

// Table Enhancement
function initializeTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Add hover effects and click handlers
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.cursor = 'pointer';
        });
    });
}

// Modal System
function initializeModals() {
    // Modal close handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target.closest('.modal'));
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Document Actions
function downloadDocument(documentId, filename) {
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Downloading...';
    button.disabled = true;
    
    // Create download link
    const link = document.createElement('a');
    link.href = `/api/documents/${documentId}/download`;
    link.download = filename;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button after 2 seconds
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function verifyDocument(documentId) {
    const button = event.target;
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Verifying...';
    button.disabled = true;
    
    fetch(`/api/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.verified) {
            showAlert('Document verification successful! ✓', 'success');
            updateVerificationStatus(documentId, 'verified');
        } else {
            showAlert('Document verification failed! ✗', 'error');
            updateVerificationStatus(documentId, 'failed');
        }
    })
    .catch(error => {
        console.error('Verification error:', error);
        showAlert('Verification failed. Please try again.', 'error');
    })
    .finally(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    });
}

function updateVerificationStatus(documentId, status) {
    const statusElement = document.querySelector(`[data-document-id="${documentId}"] .status-badge`);
    if (statusElement) {
        statusElement.className = `status-badge status-${status}`;
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Search and Filter
function searchDocuments(query) {
    const documentCards = document.querySelectorAll('.document-card');
    const tableRows = document.querySelectorAll('tbody tr');
    
    const searchTerm = query.toLowerCase();
    
    // Search in document cards
    documentCards.forEach(card => {
        const title = card.querySelector('.document-title')?.textContent.toLowerCase() || '';
        const meta = card.querySelector('.document-meta')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || meta.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Search in table rows
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterDocuments(status) {
    const documentCards = document.querySelectorAll('.document-card');
    const tableRows = document.querySelectorAll('tbody tr');
    
    // Filter document cards
    documentCards.forEach(card => {
        const statusBadge = card.querySelector('.status-badge');
        const cardStatus = statusBadge?.textContent.toLowerCase() || '';
        
        if (status === 'all' || cardStatus.includes(status)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Filter table rows
    tableRows.forEach(row => {
        const statusCell = row.querySelector('.status-badge');
        const rowStatus = statusCell?.textContent.toLowerCase() || '';
        
        if (status === 'all' || rowStatus.includes(status)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Utility Functions
function showLoading(element, message = 'Loading...') {
    if (element) {
        element.innerHTML = `<span class="loading"></span> ${message}`;
        element.disabled = true;
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const text = element.getAttribute('data-tooltip');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(event) {
    const element = event.target;
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
    }
}