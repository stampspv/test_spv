// AR 3D Model Viewer with Gesture Controls
// Supports .obj and .3ds model formats

class ARModelViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.xrSession = null;
        this.model = null;
        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;

        // Gesture control properties
        this.touches = [];
        this.lastDistance = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.modelPlaced = false;

        // Model properties
        this.modelScale = 1;
        this.modelPosition = new THREE.Vector3();

        this.init();
    }

    async init() {
        this.setupUI();
        await this.checkARSupport();
        this.setupEventListeners();
    }

    setupUI() {
        this.arButton = document.getElementById('ar-button');
        this.statusDiv = document.getElementById('status');
        this.modelSelect = document.getElementById('modelSelect');
        this.fileInput = document.getElementById('fileInput');
        this.arContainer = document.getElementById('ar-container');
    }

    async checkARSupport() {
        if (!navigator.xr) {
            this.showStatus('WebXR not supported on this device', 'error');
            this.arButton.textContent = 'AR Not Supported';
            return;
        }

        try {
            const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
            if (isSupported) {
                this.arButton.disabled = false;
                this.arButton.textContent = 'Start AR Experience';
                this.showStatus('AR is ready!', 'success');
            } else {
                this.arButton.textContent = 'AR Not Available';
                this.showStatus('AR mode not available on this device', 'error');
            }
        } catch (error) {
            console.error('Error checking AR support:', error);
            this.arButton.textContent = 'Error Checking AR';
            this.showStatus('Error checking AR support', 'error');
        }
    }

    setupEventListeners() {
        this.arButton.addEventListener('click', () => this.startAR());

        this.modelSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.fileInput.style.display = 'block';
            } else {
                this.fileInput.style.display = 'none';
            }
        });

        this.fileInput.addEventListener('change', (e) => {
            this.loadCustomModel(e.target.files[0]);
        });
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            // Stop the stream immediately as we just needed permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            this.showStatus('Camera permission is required for AR', 'error');
            return false;
        }
    }

    async startAR() {
        // Request camera permission first
        const hasPermission = await this.requestCameraPermission();
        if (!hasPermission) {
            return;
        }

        try {
            this.showStatus('Starting AR session...', 'success');

            // Create AR session
            this.xrSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });

            await this.onSessionStarted();
        } catch (error) {
            console.error('Error starting AR:', error);
            this.showStatus('Failed to start AR: ' + error.message, 'error');
        }
    }

    async onSessionStarted() {
        this.xrSession.addEventListener('end', () => this.onSessionEnded());

        // Setup Three.js scene
        this.setupThreeJS();

        // Create reticle for model placement
        this.createReticle();

        // Create default model
        this.createDefaultModel();

        // Setup WebXR rendering
        await this.renderer.xr.setSession(this.xrSession);

        // Setup gesture controls
        this.setupGestureControls();

        // Add exit button
        this.addExitButton();

        // Hide info panel
        document.getElementById('info').style.display = 'none';
        this.arContainer.classList.add('active');

        // Start render loop
        this.renderer.setAnimationLoop((timestamp, frame) => this.render(timestamp, frame));

        this.showStatus('AR session started! Tap to place the model', 'success');
    }

    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;

        this.arContainer.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
    }

    createReticle() {
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    createDefaultModel() {
        // Create a colorful default cube
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            metalness: 0.3,
            roughness: 0.4
        });
        this.model = new THREE.Mesh(geometry, material);
        this.model.visible = false;
        this.scene.add(this.model);
    }

    async loadCustomModel(file) {
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                if (fileExtension === 'obj') {
                    await this.loadOBJModel(e.target.result);
                } else if (fileExtension === '3ds') {
                    await this.load3DSModel(e.target.result);
                }
                this.showStatus('Model loaded successfully!', 'success');
            } catch (error) {
                console.error('Error loading model:', error);
                this.showStatus('Error loading model: ' + error.message, 'error');
            }
        };

        if (fileExtension === '3ds') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }

    async loadOBJModel(objData) {
        if (typeof THREE.OBJLoader === 'undefined') {
            console.error('OBJLoader not available');
            return;
        }

        const loader = new THREE.OBJLoader();
        const object = loader.parse(objData);

        // Remove old model
        if (this.model) {
            this.scene.remove(this.model);
        }

        // Scale and position the loaded model
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.2 / maxDim;
        object.scale.set(scale, scale, scale);

        object.visible = false;
        this.model = object;
        this.scene.add(this.model);
    }

    async load3DSModel(arrayBuffer) {
        if (typeof THREE.TDSLoader === 'undefined') {
            console.error('TDSLoader not available');
            return;
        }

        const loader = new THREE.TDSLoader();
        const object = loader.parse(arrayBuffer);

        // Remove old model
        if (this.model) {
            this.scene.remove(this.model);
        }

        // Scale and position the loaded model
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.2 / maxDim;
        object.scale.set(scale, scale, scale);

        object.visible = false;
        this.model = object;
        this.scene.add(this.model);
    }

    setupGestureControls() {
        const canvas = this.renderer.domElement;

        // Touch start
        canvas.addEventListener('touchstart', (e) => {
            this.touches = Array.from(e.touches);

            if (this.touches.length === 1) {
                this.isDragging = true;
                this.dragStart = {
                    x: this.touches[0].clientX,
                    y: this.touches[0].clientY
                };
            } else if (this.touches.length === 2) {
                const dx = this.touches[0].clientX - this.touches[1].clientX;
                const dy = this.touches[0].clientY - this.touches[1].clientY;
                this.lastDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.touches = Array.from(e.touches);

            if (this.modelPlaced) {
                if (this.touches.length === 1 && this.isDragging) {
                    // Single finger drag - move model horizontally
                    this.handleDrag(this.touches[0]);
                } else if (this.touches.length === 2) {
                    // Two finger pinch - scale model
                    this.handlePinch();
                }
            }
        }, { passive: false });

        // Touch end
        canvas.addEventListener('touchend', (e) => {
            this.touches = Array.from(e.touches);

            if (this.touches.length < 2) {
                this.lastDistance = 0;
            }

            if (this.touches.length === 0) {
                this.isDragging = false;
            }
        }, { passive: true });

        // Tap to place model
        canvas.addEventListener('click', (e) => {
            if (!this.modelPlaced && this.reticle.visible) {
                this.placeModel();
            }
        });
    }

    handleDrag(touch) {
        if (!this.model || !this.modelPlaced) return;

        const deltaX = (touch.clientX - this.dragStart.x) * 0.001;
        const deltaY = (touch.clientY - this.dragStart.y) * 0.001;

        this.model.position.x += deltaX;
        this.model.position.z += deltaY;

        this.dragStart = {
            x: touch.clientX,
            y: touch.clientY
        };
    }

    handlePinch() {
        if (!this.model || !this.modelPlaced) return;

        const dx = this.touches[0].clientX - this.touches[1].clientX;
        const dy = this.touches[0].clientY - this.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.lastDistance > 0) {
            const delta = distance - this.lastDistance;
            const scaleFactor = 1 + (delta * 0.01);

            this.modelScale *= scaleFactor;
            this.modelScale = Math.max(0.1, Math.min(5, this.modelScale)); // Limit scale

            this.model.scale.multiplyScalar(scaleFactor);
        }

        this.lastDistance = distance;
    }

    placeModel() {
        if (!this.model || !this.reticle.visible) return;

        this.model.position.setFromMatrixPosition(this.reticle.matrix);
        this.model.visible = true;
        this.modelPlaced = true;
        this.reticle.visible = false;

        this.showStatus('Model placed! Use gestures to move and scale', 'success');
        setTimeout(() => {
            this.statusDiv.classList.remove('show');
        }, 3000);
    }

    addExitButton() {
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit AR';
        exitButton.className = 'ar-exit';
        exitButton.addEventListener('click', () => {
            if (this.xrSession) {
                this.xrSession.end();
            }
        });
        document.body.appendChild(exitButton);

        // Store reference for cleanup
        this.exitButton = exitButton;
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();

            // Hit test for model placement
            if (!this.modelPlaced) {
                if (!this.hitTestSourceRequested) {
                    this.xrSession.requestReferenceSpace('viewer').then((referenceSpace) => {
                        this.xrSession.requestHitTestSource({ space: referenceSpace }).then((source) => {
                            this.hitTestSource = source;
                        });
                    });
                    this.hitTestSourceRequested = true;
                }

                if (this.hitTestSource) {
                    const hitTestResults = frame.getHitTestResults(this.hitTestSource);
                    if (hitTestResults.length > 0) {
                        const hit = hitTestResults[0];
                        const pose = hit.getPose(referenceSpace);
                        this.reticle.visible = true;
                        this.reticle.matrix.fromArray(pose.transform.matrix);
                    } else {
                        this.reticle.visible = false;
                    }
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    onSessionEnded() {
        this.xrSession = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.modelPlaced = false;

        // Reset model visibility
        if (this.model) {
            this.model.visible = false;
        }

        // Show info panel
        document.getElementById('info').style.display = 'block';
        this.arContainer.classList.remove('active');

        // Remove exit button
        if (this.exitButton) {
            this.exitButton.remove();
            this.exitButton = null;
        }

        // Clear renderer
        if (this.renderer) {
            this.arContainer.removeChild(this.renderer.domElement);
        }

        this.showStatus('AR session ended', 'success');
    }

    showStatus(message, type = '') {
        this.statusDiv.textContent = message;
        this.statusDiv.className = 'show ' + type;

        if (type === 'success') {
            setTimeout(() => {
                this.statusDiv.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize the AR viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ARModelViewer();
});
