// Universal AR 3D Model Viewer
// Uses Google Model Viewer - Works on iOS (AR Quick Look) and Android (WebXR)

class UniversalARViewer {
    constructor() {
        this.modelViewer = null;
        this.currentModel = 'default';

        // Predefined models with both GLB (Android) and USDZ (iOS) versions
        this.models = {
            default: {
                name: 'Astronaut',
                glb: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
                usdz: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz'
            },
            robot: {
                name: 'Robot',
                glb: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
                usdz: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.usdz'
            }
        };

        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupUI();
        this.detectDevice();
        this.setupEventListeners();
        this.checkARCapabilities();
    }

    setupUI() {
        this.modelViewer = document.getElementById('model-viewer');
        this.viewerContainer = document.getElementById('viewer-container');
        this.infoPanel = document.getElementById('info');
        this.modelSelect = document.getElementById('modelSelect');
        this.fileInput = document.getElementById('fileInput');
        this.menuButton = document.getElementById('menu-button');
        this.captureButton = document.getElementById('capture-button');
        this.deviceStatus = document.getElementById('device-status');
        this.arStatus = document.getElementById('ar-status');
        this.cameraFeed = document.getElementById('camera-feed');
        this.captureCanvas = document.getElementById('capture-canvas');
        this.cameraStream = null;
    }

    detectDevice() {
        const ua = navigator.userAgent;
        let deviceInfo = '';

        this.isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

        if (this.isIOS) {
            deviceInfo = '📱 iOS Device - Camera AR Mode';
            // Hide AR button on iOS to prevent redirect
            this.hideARButtonOnIOS();
        } else if (/Android/.test(ua)) {
            deviceInfo = '🤖 Android Device - Camera AR Mode';
        } else {
            deviceInfo = '💻 Desktop - 3D Viewer with Webcam';
        }

        this.deviceStatus.textContent = deviceInfo;
    }

    hideARButtonOnIOS() {
        // Wait for model-viewer to load
        setTimeout(() => {
            const arButton = document.getElementById('ar-button');
            if (arButton && this.isIOS) {
                arButton.style.display = 'none';
            }
        }, 500);
    }

    checkARCapabilities() {
        // Model Viewer handles AR capability detection automatically
        // We just need to listen for events

        this.modelViewer.addEventListener('load', () => {
            console.log('Model loaded successfully');
        });

        this.modelViewer.addEventListener('error', (error) => {
            console.error('Error loading model:', error);
            this.showStatus('Failed to load 3D model. Please try again.', 'error');
        });

        // AR session events
        this.modelViewer.addEventListener('ar-status', (event) => {
            console.log('AR Status:', event.detail.status);
        });
    }

    setupEventListeners() {
        // Model selection
        this.modelSelect.addEventListener('change', (e) => {
            const value = e.target.value;

            if (value === 'custom') {
                this.fileInput.style.display = 'block';
                this.fileInput.click();
            } else {
                this.fileInput.style.display = 'none';
                this.loadModel(value);
            }
        });

        // File upload
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadCustomModel(file);
            }
        });

        // Menu button - toggle between viewer and menu
        this.menuButton.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Capture button - take screenshot
        this.captureButton.addEventListener('click', () => {
            this.captureScreenshot();
        });

        // Request camera permission on page load
        this.requestCameraPermission();
    }

    toggleMenu() {
        const viewerActive = this.viewerContainer.classList.contains('active');

        if (viewerActive) {
            // Show menu, hide viewer
            this.viewerContainer.classList.remove('active');
            this.infoPanel.classList.add('active');
            document.body.style.overflow = 'auto';
            this.stopCameraFeed();
        } else {
            // Show viewer, hide menu
            this.infoPanel.classList.remove('active');
            this.viewerContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.requestCameraPermission();
        }
    }

    loadModel(modelKey) {
        const model = this.models[modelKey];
        if (!model) return;

        this.currentModel = modelKey;
        this.modelViewer.setAttribute('src', model.glb);
        this.modelViewer.setAttribute('alt', model.name);

        this.showStatus(`Loading ${model.name}...`, 'info');

        // Close menu and show viewer
        this.infoPanel.classList.remove('active');
        this.viewerContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    loadCustomModel(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!['glb', 'gltf'].includes(fileExtension)) {
            this.showStatus('Please upload a .glb or .gltf file', 'error');
            return;
        }

        // Create object URL for the file
        const url = URL.createObjectURL(file);

        this.modelViewer.setAttribute('src', url);
        this.modelViewer.setAttribute('alt', file.name);

        // Note: Custom models won't have iOS USDZ version
        // You'd need to convert GLB to USDZ for iOS AR support
        this.showStatus(`Loading ${file.name}...`, 'info');

        // Close menu and show viewer
        this.infoPanel.classList.remove('active');
        this.viewerContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    async requestCameraPermission() {
        // Start the camera feed for AR-like background
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const constraints = {
                    video: {
                        facingMode: 'environment', // Use back camera on mobile
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                };

                this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
                this.cameraFeed.srcObject = this.cameraStream;

                console.log('Camera feed started');
                this.showStatus('Camera feed active!', 'success');
            }
        } catch (error) {
            console.error('Camera permission denied:', error);
            this.showStatus('Camera access denied. Using white background.', 'error');
            this.cameraFeed.style.display = 'none';
        }
    }

    stopCameraFeed() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
            this.cameraFeed.srcObject = null;
        }
    }

    async captureScreenshot() {
        try {
            // Add flash animation to button
            this.captureButton.classList.add('capturing');

            // Get viewport dimensions
            const width = this.viewerContainer.clientWidth;
            const height = this.viewerContainer.clientHeight;

            // Setup canvas
            const canvas = this.captureCanvas;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Draw camera feed background
            if (this.cameraFeed.srcObject && this.cameraFeed.readyState >= 2) {
                ctx.drawImage(this.cameraFeed, 0, 0, width, height);
            } else {
                // Fallback to white background if camera not available
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }

            // Get 3D model screenshot with transparency
            const blob = await this.modelViewer.toBlob({
                mimeType: 'image/png',
                qualityArgument: 1.0,
                idealAspect: true
            });

            // Convert blob to image and overlay on camera
            const modelImage = await this.blobToImage(blob);
            ctx.drawImage(modelImage, 0, 0, width, height);

            // Convert canvas to blob and download
            canvas.toBlob((finalBlob) => {
                this.downloadImage(finalBlob);
                this.showStatus('Screenshot saved!', 'success');

                // Remove flash animation
                setTimeout(() => {
                    this.captureButton.classList.remove('capturing');
                }, 500);
            }, 'image/png');

        } catch (error) {
            console.error('Screenshot failed:', error);
            this.showStatus('Failed to capture screenshot', 'error');
            this.captureButton.classList.remove('capturing');
        }
    }

    blobToImage(blob) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        link.download = `ar-capture-${timestamp}-${time}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showStatus(message, type = 'info') {
        this.arStatus.textContent = message;
        this.arStatus.className = `show ${type}`;

        // Auto-hide after 3 seconds for success/info messages
        if (type !== 'error') {
            setTimeout(() => {
                this.arStatus.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize the viewer
const viewer = new UniversalARViewer();

// Add helper to convert models (info for users)
console.log(`
╔════════════════════════════════════════════════════════════╗
║  Universal AR 3D Model Viewer - Ready!                     ║
╚════════════════════════════════════════════════════════════╝

📱 iOS Support: AR Quick Look (requires .usdz files)
🤖 Android Support: WebXR AR (requires .glb/.gltf files)
💻 Desktop Support: 3D viewer with rotation and zoom

For custom models:
- Use .glb or .gltf format
- Convert to .usdz for iOS AR using: https://www.vectary.com/3d-modeling-news/free-gltf-to-usdz-converter/

Model Viewer Documentation:
https://modelviewer.dev/

Gesture Controls (built-in):
- Drag: Rotate model
- Pinch: Zoom in/out
- Two-finger drag: Pan model
- AR Mode: All mobile AR gestures supported
`);
