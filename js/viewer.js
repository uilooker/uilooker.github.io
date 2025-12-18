// Modern Responsive Design Checker JavaScript

let currentUrl = '';
let currentDevice = { width: 1366, height: 1024, name: 'Desktop' };
let currentZoom = 1;

// Drag functionality variables
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeViewer();
});

function initializeViewer() {
    console.log('Initializing modern viewer...');
    
    // Get URL from query parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    currentUrl = urlParams.get('url') || localStorage.getItem('testUrl') || '';
    
    // Update URL input
    const urlInput = document.getElementById('urlInput');
    if (urlInput && currentUrl) {
        urlInput.value = currentUrl;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load website if URL is provided
    if (currentUrl) {
        loadWebsite(currentUrl);
    }
}

function initializeEventListeners() {
    // URL input and GO button
    const urlInput = document.getElementById('urlInput');
    const goBtn = document.getElementById('goBtn');
    
    if (goBtn) {
        goBtn.addEventListener('click', handleUrlSubmit);
    }
    
    if (urlInput) {
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleUrlSubmit();
            }
        });
    }
    
    // Device selection buttons
    document.querySelectorAll('.device-icon').forEach(btn => {
        btn.addEventListener('click', function() {
            const width = parseInt(this.dataset.width);
            const height = parseInt(this.dataset.height);
            const name = this.dataset.name;
            
            setActiveDevice(this);
            updateDeviceSize(width, height, name);
        });
    });
    
    // Action buttons
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareCurrentView);
    }
    
    // Zoom controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const fitToScreenBtn = document.getElementById('fitToScreenBtn');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => adjustZoom(0.1));
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => adjustZoom(-0.1));
    }
    
    if (fitToScreenBtn) {
        fitToScreenBtn.addEventListener('click', fitToScreen);
    }
    
    const fullAccessBtn = document.getElementById('getFullAccessBtn');
    if (fullAccessBtn) {
        fullAccessBtn.addEventListener('click', showFullAccessInfo);
    }
    
    // Error state buttons
    const retryBtn = document.getElementById('retryBtn');
    const openExternalBtn = document.getElementById('openExternalBtn');
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => loadWebsite(currentUrl));
    }
    
    if (openExternalBtn) {
        openExternalBtn.addEventListener('click', () => window.open(currentUrl, '_blank'));
    }
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');
    const closeNavMenu = document.getElementById('closeNavMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    if (closeNavMenu) {
        closeNavMenu.addEventListener('click', closeMenu);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', function(e) {
            if (e.target === navOverlay) {
                closeMenu();
            }
        });
    }
    
    // Navigation menu actions
    const screenshotBtn = document.getElementById('screenshotBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', function() {
            takeScreenshot();
            closeMenu();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshWebsite();
            closeMenu();
        });
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            toggleFullscreen();
            closeMenu();
        });
    }
    
    // Initialize drag functionality
    initializeDragFunctionality();
}

function handleUrlSubmit() {
    const urlInput = document.getElementById('urlInput');
    let url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a website URL', 'error');
        return;
    }
    
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    currentUrl = url;
    localStorage.setItem('testUrl', url);
    
    // Update URL in address bar
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('url', url);
    window.history.pushState({}, '', newUrl);
    
    loadWebsite(url);
}

function loadWebsite(url) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const devicePreview = document.getElementById('devicePreview');
    const websiteFrame = document.getElementById('websiteFrame');
    
    // Show loading state
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    devicePreview.style.display = 'none';
    
    // Update device preview size
    updatePreviewSize();
    
    // Set iframe source
    websiteFrame.src = url;
    
    // Handle iframe load events
    websiteFrame.onload = function() {
        setTimeout(() => {
            loadingState.style.display = 'none';
            devicePreview.style.display = 'block';
        }, 800);
    };
    
    websiteFrame.onerror = function() {
        showError('Failed to load the website. The site may not allow iframe embedding.');
    };
    
    // Timeout fallback
    setTimeout(() => {
        if (loadingState.style.display !== 'none') {
            try {
                // Try to access iframe content to check if it loaded
                const iframeDoc = websiteFrame.contentDocument || websiteFrame.contentWindow.document;
                if (iframeDoc.readyState === 'complete') {
                    loadingState.style.display = 'none';
                    devicePreview.style.display = 'block';
                } else {
                    showError('The website is taking too long to load or may not allow iframe embedding.');
                }
            } catch (e) {
                // Cross-origin error - site loaded but we can't access it
                loadingState.style.display = 'none';
                devicePreview.style.display = 'block';
            }
        }
    }, 10000);
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const devicePreview = document.getElementById('devicePreview');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingState.style.display = 'none';
    devicePreview.style.display = 'none';
    errorState.style.display = 'block';
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

function setActiveDevice(activeBtn) {
    document.querySelectorAll('.device-icon').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function updateDeviceSize(width, height, name) {
    currentDevice = { width, height, name };
    
    // Reset zoom when switching devices
    currentZoom = 1;
    
    // Update size display in header
    const deviceWidth = document.getElementById('deviceWidth');
    const deviceHeight = document.getElementById('deviceHeight');
    
    if (deviceWidth) deviceWidth.textContent = width;
    if (deviceHeight) deviceHeight.textContent = height;
    
    // Update preview container size
    updatePreviewSize();
    updateZoomIndicator();
    
    showNotification(`Switched to ${name} view (${width} × ${height})`, 'success');
}

function updatePreviewSize() {
    const previewContainer = document.querySelector('.preview-container');
    const mockupFrame = document.querySelector('.mockup-frame');
    
    if (!previewContainer || !mockupFrame) return;
    
    const { width, height } = currentDevice;
    
    // Calculate available space more accurately
    const isMobile = window.innerWidth <= 768;
    const sidebarWidth = isMobile ? 0 : 80;
    const headerHeight = isMobile ? 140 : 70;
    const actionButtonHeight = isMobile ? 80 : 60; // Account for action button
    const padding = isMobile ? 20 : 40; // Minimal padding for maximum space utilization
    
    const maxWidth = window.innerWidth - sidebarWidth - padding;
    const maxHeight = window.innerHeight - headerHeight - actionButtonHeight - padding;
    
    // Calculate base scale to fit in viewport
    let baseScale = Math.min(maxWidth / width, maxHeight / height);
    
    // For small devices on large screens, allow scaling up to a reasonable maximum
    // This prevents tiny mobile views on large desktop screens
    const maxScaleUp = isMobile ? 2 : 3; // Allow more scaling on desktop
    const minScaleDown = 0.1; // Minimum scale for very large content
    
    // Ensure the scale is within reasonable bounds
    baseScale = Math.min(baseScale, maxScaleUp);
    baseScale = Math.max(baseScale, minScaleDown);
    
    // Apply user zoom
    let finalScale = baseScale * currentZoom;
    
    // Final bounds check
    finalScale = Math.max(finalScale, 0.05);
    finalScale = Math.min(finalScale, 10);
    
    // Apply dimensions to the frame
    mockupFrame.style.width = width + 'px';
    mockupFrame.style.height = height + 'px';
    
    // Apply scale with proper transform origin
    previewContainer.style.transform = `scale(${finalScale})`;
    previewContainer.style.transformOrigin = 'center center';
    
    // Handle overflow intelligently
    const contentWrapper = document.querySelector('.content-wrapper');
    const scaledWidth = width * finalScale;
    const scaledHeight = height * finalScale;
    
    if (scaledWidth > maxWidth || scaledHeight > maxHeight) {
        contentWrapper.style.overflow = 'auto';
        contentWrapper.style.overflowX = scaledWidth > maxWidth ? 'auto' : 'hidden';
        contentWrapper.style.overflowY = scaledHeight > maxHeight ? 'auto' : 'hidden';
    } else {
        contentWrapper.style.overflow = 'hidden';
    }
    
    // Update drag cursor based on scrollability
    setTimeout(updateDragCursor, 100);
    
    // Debug info
    console.log(`Device: ${width}x${height}, Available: ${maxWidth}x${maxHeight}, Base Scale: ${baseScale.toFixed(3)}, Final Scale: ${finalScale.toFixed(3)}, Scaled Size: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`);
}

function adjustZoom(delta) {
    currentZoom = Math.max(0.2, Math.min(5, currentZoom + delta));
    updatePreviewSize();
    updateZoomIndicator();
    
    const zoomPercentage = Math.round(currentZoom * 100);
    showNotification(`Zoom: ${zoomPercentage}%`, 'info');
}

function fitToScreen() {
    // Smart fit: automatically determine the best zoom level
    const { width, height } = currentDevice;
    const isMobile = window.innerWidth <= 768;
    const sidebarWidth = isMobile ? 0 : 80;
    const headerHeight = isMobile ? 140 : 70;
    const actionButtonHeight = isMobile ? 80 : 60;
    const padding = isMobile ? 20 : 40;
    
    const maxWidth = window.innerWidth - sidebarWidth - padding;
    const maxHeight = window.innerHeight - headerHeight - actionButtonHeight - padding;
    
    // Calculate optimal scale that uses 90% of available space
    const optimalScale = Math.min(
        (maxWidth * 0.9) / width,
        (maxHeight * 0.9) / height
    );
    
    // Set zoom to achieve this scale
    currentZoom = Math.max(0.2, Math.min(5, optimalScale));
    
    updatePreviewSize();
    updateZoomIndicator();
    
    const percentage = Math.round(currentZoom * 100);
    showNotification(`Smart fit applied (${percentage}%)`, 'success');
}

function updateZoomIndicator() {
    const zoomIndicator = document.getElementById('zoomIndicator');
    const zoomPercentage = document.getElementById('zoomPercentage');
    
    if (zoomIndicator && zoomPercentage) {
        const percentage = Math.round(currentZoom * 100);
        zoomPercentage.textContent = percentage + '%';
        
        // Show indicator only when zoom is not 100%
        if (currentZoom !== 1) {
            zoomIndicator.style.display = 'flex';
        } else {
            zoomIndicator.style.display = 'none';
        }
    }
}

function shareCurrentView() {
    if (!currentUrl) {
        showNotification('No website loaded to share', 'error');
        return;
    }
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(currentUrl)}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Responsive Design Check',
            text: `Check how ${currentUrl} looks on different devices`,
            url: shareUrl
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showFullAccessInfo() {
    showNotification('Ask Ai features coming soon!', 'info');
}

function toggleMenu() {
    const navOverlay = document.getElementById('navOverlay');
    if (navOverlay) {
        navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMenu() {
    const navOverlay = document.getElementById('navOverlay');
    if (navOverlay) {
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function takeScreenshot() {
    const websiteFrame = document.getElementById('websiteFrame');
    const previewContainer = document.querySelector('.preview-container');
    
    if (!previewContainer || previewContainer.style.display === 'none') {
        showNotification('No website loaded to screenshot', 'error');
        return;
    }
    
    // For demo purposes, show a success message
    // In a real implementation, you'd use html2canvas or similar
    showNotification('Screenshot feature coming soon!', 'info');
}

function refreshWebsite() {
    if (!currentUrl) {
        showNotification('No website loaded to refresh', 'error');
        return;
    }
    
    const websiteFrame = document.getElementById('websiteFrame');
    if (websiteFrame) {
        websiteFrame.src = websiteFrame.src;
        showNotification('Website refreshed', 'success');
    }
}

function toggleFullscreen() {
    const previewContainer = document.querySelector('.preview-container');
    
    if (!previewContainer || previewContainer.style.display === 'none') {
        showNotification('No website loaded for fullscreen', 'error');
        return;
    }
    
    if (!document.fullscreenElement) {
        previewContainer.requestFullscreen().then(() => {
            showNotification('Entered fullscreen mode. Press ESC to exit.', 'success');
        }).catch(() => {
            showNotification('Fullscreen not supported', 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    if (document.getElementById('devicePreview').style.display !== 'none') {
        updatePreviewSize();
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes menu
    if (e.key === 'Escape') {
        const navOverlay = document.getElementById('navOverlay');
        if (navOverlay && navOverlay.classList.contains('active')) {
            closeMenu();
        }
    }
    
    // Ctrl/Cmd + R: Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && currentUrl) {
        e.preventDefault();
        refreshWebsite();
    }
    
    // F11: Fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    // Zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        adjustZoom(0.1);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        adjustZoom(-0.1);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        currentZoom = 1;
        updatePreviewSize();
        showNotification('Zoom reset to 100%', 'info');
    }
    
    // Arrow keys for panning when content is scrollable
    if (isContentScrollable() && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const contentWrapper = document.querySelector('.content-wrapper');
        const panStep = 50;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                contentWrapper.scrollTop -= panStep;
                break;
            case 'ArrowDown':
                e.preventDefault();
                contentWrapper.scrollTop += panStep;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                contentWrapper.scrollLeft -= panStep;
                break;
            case 'ArrowRight':
                e.preventDefault();
                contentWrapper.scrollLeft += panStep;
                break;
        }
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        error: '#ef4444',
        success: '#10b981',
        info: '#3b82f6'
    };
    
    const icons = {
        error: 'bi-exclamation-circle',
        success: 'bi-check-circle',
        info: 'bi-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi ${icons[type]}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize with default device if no URL provided
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const firstDevice = document.querySelector('.device-icon.active');
        if (firstDevice && !currentUrl) {
            // Show a placeholder or instructions
            const loadingState = document.getElementById('loadingState');
            const devicePreview = document.getElementById('devicePreview');
            
            if (loadingState) {
                loadingState.innerHTML = `
                    <div class="welcome-state">
                        <div class="welcome-icon">
                            <i class="bi bi-globe"></i>
                        </div>
                        <h3>Welcome to Responsive Design Checker</h3>
                        <p>Enter a website URL above to see how it looks on different devices</p>
                    </div>
                `;
            }
        }
    }, 100);
});

// Add welcome state styles
const welcomeStyles = `
    .welcome-state {
        text-align: center;
        color: #64748b;
    }
    
    .welcome-icon {
        font-size: 48px;
        color: #3b82f6;
        margin-bottom: 24px;
    }
    
    .welcome-state h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 12px 0;
    }
    
    .welcome-state p {
        font-size: 14px;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
    }
`;

// Inject welcome styles
const styleSheet = document.createElement('style');
styleSheet.textContent = welcomeStyles;
document.head.appendChild(styleSheet);

// Drag functionality implementation
function initializeDragFunctionality() {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (!contentWrapper) return;
    
    // Mouse events
    contentWrapper.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    contentWrapper.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    // Prevent context menu on right click during drag
    contentWrapper.addEventListener('contextmenu', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    });
}

function startDrag(e) {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    // Only enable drag if content is scrollable
    if (!isContentScrollable()) return;
    
    // Don't start drag on iframe to avoid interfering with website interaction
    if (e.target.tagName === 'IFRAME') return;
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    scrollStartX = contentWrapper.scrollLeft;
    scrollStartY = contentWrapper.scrollTop;
    
    contentWrapper.style.cursor = 'grabbing';
    contentWrapper.style.userSelect = 'none';
    
    e.preventDefault();
}

function startDragTouch(e) {
    if (e.touches.length !== 1) return;
    
    const contentWrapper = document.querySelector('.content-wrapper');
    
    // Only enable drag if content is scrollable
    if (!isContentScrollable()) return;
    
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    scrollStartX = contentWrapper.scrollLeft;
    scrollStartY = contentWrapper.scrollTop;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const contentWrapper = document.querySelector('.content-wrapper');
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    contentWrapper.scrollLeft = scrollStartX - deltaX;
    contentWrapper.scrollTop = scrollStartY - deltaY;
    
    e.preventDefault();
}

function dragTouch(e) {
    if (!isDragging || e.touches.length !== 1) return;
    
    const contentWrapper = document.querySelector('.content-wrapper');
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    
    contentWrapper.scrollLeft = scrollStartX - deltaX;
    contentWrapper.scrollTop = scrollStartY - deltaY;
    
    e.preventDefault();
}

function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const contentWrapper = document.querySelector('.content-wrapper');
    
    contentWrapper.style.cursor = '';
    contentWrapper.style.userSelect = '';
}

function isContentScrollable() {
    const contentWrapper = document.querySelector('.content-wrapper');
    if (!contentWrapper) return false;
    
    return (
        contentWrapper.scrollWidth > contentWrapper.clientWidth ||
        contentWrapper.scrollHeight > contentWrapper.clientHeight
    );
}

function updateDragCursor() {
    const contentWrapper = document.querySelector('.content-wrapper');
    const dragToggleBtn = document.getElementById('dragToggleBtn');
    
    if (!contentWrapper) return;
    
    const wasScrollable = contentWrapper.classList.contains('draggable');
    const isScrollable = isContentScrollable();
    
    if (isScrollable) {
        contentWrapper.style.cursor = 'grab';
        contentWrapper.classList.add('draggable');
        
        if (dragToggleBtn) {
            dragToggleBtn.disabled = false;
            dragToggleBtn.classList.add('drag-active');
            dragToggleBtn.title = 'Drag to Pan (Active) - Click and drag to move around';
        }
        
        // Show notification when drag becomes available for the first time
        if (!wasScrollable && currentUrl) {
            setTimeout(() => {
                showNotification('Drag to pan is now available! Click and drag to move around.', 'info');
            }, 500);
        }
    } else {
        contentWrapper.style.cursor = '';
        contentWrapper.classList.remove('draggable');
        
        if (dragToggleBtn) {
            dragToggleBtn.disabled = true;
            dragToggleBtn.classList.remove('drag-active');
            dragToggleBtn.title = 'Drag to Pan (Auto) - Available when zoomed or content is larger';
        }
    }
}