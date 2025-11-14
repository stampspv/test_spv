# AR 3D Model Viewer with Gesture Controls

A web-based Augmented Reality application that allows you to view and interact with 3D models in AR using camera feed and intuitive gesture controls.

## Features

- **WebXR AR Support**: Uses WebXR Device API for immersive AR experiences
- **3D Model Loading**: Support for .OBJ and .3DS file formats
- **Gesture Controls**:
  - **Tap**: Place model in AR space
  - **Single-finger drag**: Move model horizontally
  - **Two-finger pinch**: Scale model up/down
  - **Two-finger drag**: Move model in 3D space
- **Camera Permission**: Automatic camera permission request for AR
- **Responsive Design**: Works on mobile and tablet devices

## Requirements

### Device Requirements
- A device with WebXR support (modern Android phones/tablets with ARCore)
- Camera access permission
- HTTPS connection (required for WebXR)

### Supported Browsers
- **Chrome for Android** (version 79+) with ARCore support
- **Edge for Android** (version 79+) with ARCore support
- **Samsung Internet** (version 15+) with ARCore support

**Note**: iOS devices currently have limited WebXR support. For iOS, consider using alternative AR solutions like AR Quick Look.

### Supported Devices
- Android phones/tablets with ARCore support
- Check if your device supports ARCore: https://developers.google.com/ar/devices

## Installation & Setup

### Option 1: Local Development Server

1. Clone or download this repository

2. Serve the files using a local HTTPS server (required for WebXR):

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   ```

   Using Node.js (http-server):
   ```bash
   npm install -g http-server
   http-server -p 8000
   ```

   Using ngrok (for HTTPS):
   ```bash
   # First start a local server on port 8000
   python -m http.server 8000

   # Then in another terminal, create HTTPS tunnel
   ngrok http 8000
   ```

3. Access the application:
   - For local testing (non-HTTPS): `http://localhost:8000`
   - For AR testing (HTTPS required): Use ngrok URL or deploy to HTTPS server

### Option 2: Deploy to Web Server

Deploy the files to any web hosting service that supports HTTPS:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Your own web server with SSL certificate

## Usage

### Starting AR Experience

1. Open the website on your AR-supported device
2. Click "Start AR Experience" button
3. Grant camera permission when prompted
4. Point your camera at a flat surface (floor, table, etc.)
5. Wait for the white reticle to appear on the surface
6. Tap the screen to place the 3D model

### Gesture Controls

Once the model is placed in AR:

- **Move Model**: Touch and drag with one finger to move the model horizontally
- **Scale Model**: Use two-finger pinch gesture to make the model larger or smaller
- **Rotate View**: Move your device around to see the model from different angles

### Loading Custom 3D Models

1. Select "Upload .obj/.3ds file" from the model dropdown
2. Click the file input that appears
3. Choose your .OBJ or .3DS file from your device
4. The model will be loaded and ready to place in AR

### Exiting AR

Click the "Exit AR" button in the top-right corner to return to the main menu.

## File Structure

```
├── index.html          # Main HTML page
├── style.css           # Styling and layout
├── app.js             # AR application logic
└── README.md          # This file
```

## Technical Details

### Technologies Used

- **Three.js (r152)**: 3D graphics library
- **WebXR Device API**: AR session management
- **OBJLoader**: Loading .obj 3D models
- **TDSLoader**: Loading .3ds 3D models (3D Studio Max)

### Code Architecture

The application is built using a class-based architecture:

```javascript
class ARModelViewer {
    - setupThreeJS()          // Initialize Three.js scene
    - checkARSupport()        // Verify WebXR availability
    - startAR()               // Begin AR session
    - setupGestureControls()  // Handle touch gestures
    - loadCustomModel()       // Load .obj/.3ds files
    - placeModel()            // Place model in AR space
    - handleDrag()            // Move model gesture
    - handlePinch()           // Scale model gesture
}
```

### Key Features Implementation

#### Camera Permission
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
});
```

#### AR Session
```javascript
this.xrSession = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay']
});
```

#### Gesture Recognition
- Single touch: Drag to move
- Two touches: Pinch to scale
- Touch distance calculation for pinch detection

## Troubleshooting

### "AR Not Supported" Message

**Possible causes:**
- Device doesn't support ARCore
- Browser doesn't support WebXR
- Using HTTP instead of HTTPS

**Solutions:**
- Check if your device is in the [ARCore supported devices list](https://developers.google.com/ar/devices)
- Update your browser to the latest version
- Access the site via HTTPS (use ngrok or deploy to HTTPS server)

### Camera Permission Denied

**Solution:**
- Go to browser settings → Site settings → Camera
- Allow camera access for this website
- Refresh the page

### Model Not Appearing

**Possible causes:**
- AR session not started
- Surface not detected
- Model scale too small/large

**Solutions:**
- Ensure you've tapped to place the model
- Point camera at a well-lit, textured surface
- Try pinching to scale the model

### Reticle (white ring) Not Showing

**Solutions:**
- Move your device around slowly
- Point at a flat, well-lit surface
- Ensure good lighting conditions
- Try a surface with more texture/detail

### Custom Model Not Loading

**Possible causes:**
- Unsupported file format
- File too large
- Corrupted model file

**Solutions:**
- Verify file is .obj or .3ds format
- Try a smaller model file
- Test with a known working model file

## Browser Console

For debugging, open browser developer console:
- Chrome Android: `chrome://inspect` on desktop Chrome
- Enable USB debugging on Android device
- Connect device via USB
- Click "Inspect" on your device's browser tab

## Creating 3D Models

### Recommended Tools
- **Blender** (Free, open-source): Export to .obj format
- **3DS Max**: Native .3ds format support
- **SketchUp**: Export to .obj via plugin

### Model Guidelines
- Keep polygon count under 50,000 for best performance
- Use simple textures or vertex colors
- Export with correct scale (model will be auto-scaled to ~20cm)
- Center the model at origin (0,0,0)

### Where to Find Models
- **Sketchfab**: Download free models in .obj format
- **TurboSquid**: Commercial and free models
- **Free3D**: Free 3D models
- **CGTrader**: Marketplace for 3D models

## Performance Tips

1. **Optimize Models**: Use low-poly models for better performance
2. **Good Lighting**: Ensure adequate lighting for better AR tracking
3. **Stable Surface**: Use flat, textured surfaces for best results
4. **Close Other Apps**: Free up device memory
5. **Latest Browser**: Keep browser updated for best performance

## Security & Privacy

- Camera access is only used for AR functionality
- No images or video are recorded or transmitted
- All processing happens locally on your device
- Camera stream stops when AR session ends

## License

This project is open source and available for personal and commercial use.

## Credits

- Built with [Three.js](https://threejs.org/)
- Uses [WebXR Device API](https://www.w3.org/TR/webxr/)
- Loaders from Three.js examples

## Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue on the project repository
- Consult WebXR documentation: https://immersiveweb.dev/

## Future Enhancements

Planned features:
- Multiple model support
- Rotation gestures
- Material/texture editing
- Screenshot/recording functionality
- Model library integration
- Lighting controls
- Shadow rendering

---

**Note**: WebXR is an evolving technology. Features and browser support may change over time.
