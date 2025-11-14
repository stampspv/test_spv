# Universal AR 3D Model Viewer

A cross-platform web-based Augmented Reality application that works on **iOS, Android, and Desktop**! View and interact with 3D models using intuitive gesture controls.

## ✨ Features

- **Universal Platform Support**:
  - ✅ **iOS Safari**: AR Quick Look
  - ✅ **Android Chrome/Edge**: WebXR AR + Scene Viewer
  - ✅ **Desktop**: Interactive 3D viewer

- **3D Model Support**: `.glb` and `.gltf` formats (industry standard)
- **Gesture Controls**: Drag to rotate, pinch to zoom, AR gestures
- **Auto-Detection**: Automatically detects device and uses the best AR mode
- **Camera Permission**: Automatic camera permission request for AR
- **Responsive Design**: Works on all screen sizes

## 🎯 How It Works

This app uses **Google's Model Viewer** library which intelligently:
- Uses **WebXR** on Android (immersive AR)
- Uses **AR Quick Look** on iOS (native AR)
- Uses **Scene Viewer** on Android without WebXR
- Falls back to **3D viewer** on desktop

## 📱 Device Support

### iOS (iPhone/iPad)
- **Browser**: Safari
- **AR Method**: AR Quick Look (built into iOS)
- **Requirements**: iOS 12+
- **File Format**: `.usdz` (auto-provided for demo models)

### Android
- **Browser**: Chrome, Edge, Samsung Internet
- **AR Method**: WebXR or Scene Viewer
- **Requirements**: Android 7.0+ with ARCore
- **File Format**: `.glb` or `.gltf`

### Desktop
- **Browser**: Any modern browser
- **Mode**: 3D Viewer (rotate, zoom)
- **File Format**: `.glb` or `.gltf`

## 🚀 Installation & Setup

### Quick Start (Local Testing)

1. **Clone or download** this repository

2. **Start a local web server**:

   ```bash
   # Python 3
   python -m http.server 8000

   # OR Node.js
   npx http-server -p 8000
   ```

3. **Open in browser**:
   - Desktop: `http://localhost:8000`
   - Mobile: Use your computer's IP address `http://YOUR_IP:8000`

4. **For AR Testing** (HTTPS required on some devices):
   ```bash
   # Use ngrok for HTTPS tunnel
   ngrok http 8000
   ```

### Deploy to Production

Deploy to any static hosting service:

- **GitHub Pages**: Free, HTTPS included
- **Netlify**: One-click deploy
- **Vercel**: Automatic deployments
- **Firebase Hosting**: Google's free hosting

Simply upload the files and access via HTTPS!

## 📖 Usage Guide

### Basic Usage

1. **Open the website** on any device
2. **See device detection** - Shows which AR mode is available
3. **Click "View 3D Model"** to see the model in 3D
4. **Click "View in AR"** to launch AR mode (mobile only)

### 3D Viewer Controls (Desktop & Mobile)

- **Rotate**: Click/touch and drag
- **Zoom**: Scroll wheel or pinch gesture
- **Pan**: Right-click drag or two-finger drag

### AR Mode (Mobile Only)

**iOS:**
1. Tap "View in AR" button
2. AR Quick Look opens automatically
3. Point camera at surface
4. Tap to place model
5. Use gestures to move, scale, rotate

**Android:**
1. Tap "View in AR" button
2. Grant camera permission if prompted
3. Point camera at flat surface
4. Tap to place model
5. Use gestures to interact

### Loading Custom Models

1. Click dropdown menu
2. Select "Upload .glb/.gltf file"
3. Choose your 3D model file
4. Model loads automatically

**Note**: For iOS AR support with custom models, you need both `.glb` and `.usdz` versions.

## 🎨 Supported 3D Model Formats

### Primary Formats (Recommended)

- **GLB** (GL Binary): Single-file format, includes textures
- **GLTF** (GL Transmission Format): JSON-based, may have external textures

### Why GLB/GLTF?

- Industry standard (Khronos Group)
- Supported by all major 3D tools
- Smaller file sizes
- Better performance
- PBR materials support

### Converting Other Formats

Need to convert `.obj`, `.fbx`, `.3ds` to `.glb`?

**Online Converters:**
- [https://products.aspose.app/3d/conversion](https://products.aspose.app/3d/conversion)
- [https://anyconv.com/obj-to-glb-converter/](https://anyconv.com/obj-to-glb-converter/)
- [https://www.vectary.com/3d-modeling-news/free-gltf-to-usdz-converter/](https://www.vectary.com/3d-modeling-news/free-gltf-to-usdz-converter/)

**Desktop Tools:**
- **Blender** (Free): Import → Export as GLB
- **3DS Max**: Export plugin available
- **Maya**: Export via FBX → Blender → GLB

**For iOS AR (USDZ):**
- Use Reality Converter (Mac only, free)
- Online: [https://www.vectary.com/3d-modeling-news/free-gltf-to-usdz-converter/](https://www.vectary.com/3d-modeling-news/free-gltf-to-usdz-converter/)

## 🛠️ Technical Details

### Technologies Used

- **Model Viewer**: Google's web component for 3D/AR
- **WebXR Device API**: Android AR (automatic)
- **AR Quick Look**: iOS AR (automatic)
- **Scene Viewer**: Android fallback (automatic)
- **Vanilla JavaScript**: No framework dependencies
- **Web Components**: Native browser technology

### File Structure

```
├── index.html          # Main HTML with Model Viewer
├── style.css           # Responsive styling
├── app.js             # Application logic
└── README.md          # Documentation
```

### Key Implementation

```html
<model-viewer
    src="model.glb"
    ios-src="model.usdz"
    ar
    ar-modes="webxr scene-viewer quick-look"
    camera-controls
    auto-rotate
></model-viewer>
```

The `ar-modes` attribute tells Model Viewer to try:
1. WebXR (Android Chrome/Edge)
2. Scene Viewer (Android fallback)
3. Quick Look (iOS)

## 🐛 Troubleshooting

### "AR Not Working" on iOS

**Causes:**
- Not using Safari browser
- iOS version too old (need iOS 12+)
- No `.usdz` file provided

**Solutions:**
- Open in Safari (not Chrome)
- Update iOS to latest version
- Ensure model has `ios-src` attribute with `.usdz` file

### "AR Not Working" on Android

**Causes:**
- Browser doesn't support WebXR
- ARCore not installed/supported
- Not using HTTPS

**Solutions:**
- Use Chrome, Edge, or Samsung Internet
- Check [ARCore supported devices](https://developers.google.com/ar/devices)
- Install Google Play Services for AR
- Use HTTPS connection

### Model Not Loading

**Causes:**
- File too large
- Wrong format
- CORS issues

**Solutions:**
- Compress model (keep under 10MB)
- Verify `.glb` or `.gltf` format
- Ensure proper CORS headers if loading from external URL

### Camera Permission Denied

**Solutions:**
- Check browser settings → Camera permissions
- Reset site permissions and reload
- On iOS: Settings → Safari → Camera

### AR Button Not Showing

**Causes:**
- AR not supported on device
- Model not loaded yet

**Solutions:**
- Verify device supports AR
- Wait for model to fully load
- Check browser console for errors

## 📊 Performance Tips

1. **Optimize Models**:
   - Keep polygon count under 100K triangles
   - Use compressed textures (JPG instead of PNG when possible)
   - Target file size under 5-10MB

2. **Network**:
   - Use CDN for model files
   - Enable gzip compression
   - Consider progressive loading

3. **Mobile Optimization**:
   - Test on actual devices
   - Use lower-poly models for mobile
   - Optimize textures for mobile GPUs

## 🔒 Privacy & Security

- Camera access only used for AR functionality
- No data transmitted to external servers
- No analytics or tracking
- All processing happens locally
- Camera stream stops when AR ends

## 📚 Resources

### Model Libraries

- **Sketchfab**: [https://sketchfab.com/](https://sketchfab.com/) - Download in GLB format
- **Poly Haven**: [https://polyhaven.com/](https://polyhaven.com/) - Free 3D models
- **Google Poly Archive**: [https://poly.pizza/](https://poly.pizza/)
- **TurboSquid**: [https://www.turbosquid.com/](https://www.turbosquid.com/)

### Learning Resources

- **Model Viewer Docs**: [https://modelviewer.dev/](https://modelviewer.dev/)
- **WebXR Explainer**: [https://immersiveweb.dev/](https://immersiveweb.dev/)
- **GLTF Tutorial**: [https://www.khronos.org/gltf/](https://www.khronos.org/gltf/)

### Tools

- **Blender** (Free): [https://www.blender.org/](https://www.blender.org/)
- **Reality Converter** (Mac): Convert GLB to USDZ
- **glTF Viewer**: [https://gltf-viewer.donmccurdy.com/](https://gltf-viewer.donmccurdy.com/)

## 🎯 Use Cases

- **E-commerce**: Preview products in AR before buying
- **Education**: Interactive 3D models for learning
- **Real Estate**: Visualize furniture in spaces
- **Gaming**: Character preview
- **Museums**: Virtual exhibits
- **Architecture**: Building visualization

## 🔧 Customization

### Change Default Model

Edit `app.js`:

```javascript
default: {
    name: 'Your Model',
    glb: 'path/to/your-model.glb',
    usdz: 'path/to/your-model.usdz'
}
```

### Adjust Camera Position

Edit `index.html`, model-viewer attributes:

```html
camera-orbit="45deg 55deg 2.5m"
```

### Change Colors/Styling

Edit `style.css` - all colors use CSS variables for easy theming.

## 📝 Browser Compatibility

| Browser | Desktop | iOS | Android | AR Support |
|---------|---------|-----|---------|------------|
| Chrome | ✅ 3D | ❌ | ✅ AR | WebXR |
| Safari | ✅ 3D | ✅ AR | ❌ | Quick Look |
| Edge | ✅ 3D | ❌ | ✅ AR | WebXR |
| Firefox | ✅ 3D | ❌ | ⚠️ 3D | Limited |
| Samsung Internet | ✅ 3D | ❌ | ✅ AR | WebXR |

## 🚀 Future Enhancements

Potential features:
- [ ] Multiple model library
- [ ] Material/lighting editor
- [ ] Screenshot/recording
- [ ] Social sharing
- [ ] QR code generator for easy sharing
- [ ] Model annotations
- [ ] Multi-model scenes
- [ ] Animation support

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💬 Support

For issues:
1. Check troubleshooting section
2. Review browser console for errors
3. Verify device compatibility
4. Check Model Viewer documentation

## 🙏 Credits

- **Google Model Viewer**: [https://modelviewer.dev/](https://modelviewer.dev/)
- **WebXR**: [https://immersiveweb.dev/](https://immersiveweb.dev/)
- **Three.js**: Used internally by Model Viewer

---

**Made with ❤️ for the AR community**

*Works on all devices - iOS, Android, and Desktop!*
