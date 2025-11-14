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
        this.deviceStatus = document.getElementById('device-status');
        this.arStatus = document.getElementById('ar-status');
    }

    detectDevice() {
        const ua = navigator.userAgent;
        let deviceInfo = '';

        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
            deviceInfo = '📱 iOS Device - AR Quick Look Supported';
        } else if (/Android/.test(ua)) {
            deviceInfo = '🤖 Android Device - WebXR AR Supported';
        } else {
            deviceInfo = '💻 Desktop - 3D Viewer Mode';
        }

        this.deviceStatus.textContent = deviceInfo;
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
        } else {
            // Show viewer, hide menu
            this.infoPanel.classList.remove('active');
            this.viewerContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    loadModel(modelKey) {
        const model = this.models[modelKey];
        if (!model) return;

        this.currentModel = modelKey;
        this.modelViewer.setAttribute('src', model.glb);
        this.modelViewer.setAttribute('ios-src', model.usdz);
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
        // Camera permission is automatically requested when AR button is clicked
        // But we can pre-request it for better UX
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                // Stop the stream immediately
                stream.getTracks().forEach(track => track.stop());
                console.log('Camera permission granted');
            }
        } catch (error) {
            // Permission denied or not available - that's okay
            // AR will request it again when needed
            console.log('Camera permission not granted yet:', error.message);
        }
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
