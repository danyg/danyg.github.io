class QRCodeReader {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.stream = null;
        this.isCameraActive = false;
    }

    initializeElements() {
        // Buttons
        this.pasteBtn = document.getElementById('pasteBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.cameraBtn = document.getElementById('cameraBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.closeCameraBtn = document.getElementById('closeCameraBtn');

        // Input elements
        this.fileInput = document.getElementById('fileInput');

        // Display elements
        this.resultSection = document.getElementById('resultSection');
        this.cameraSection = document.getElementById('cameraSection');
        this.originalImage = document.getElementById('originalImage');
        this.qrContent = document.getElementById('qrContent');
        this.errorMessage = document.getElementById('errorMessage');

        // Camera elements
        this.cameraVideo = document.getElementById('cameraVideo');
        this.cameraCanvas = document.getElementById('cameraCanvas');
    }

    bindEvents() {
        // Button events
        this.pasteBtn.addEventListener('click', () => this.handlePaste());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.cameraBtn.addEventListener('click', () => this.startCamera());
        this.copyBtn.addEventListener('click', () => this.copyContent());
        this.captureBtn.addEventListener('click', () => this.captureFromCamera());
        this.closeCameraBtn.addEventListener('click', () => this.stopCamera());

        // File input event
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Global paste event
        document.addEventListener('paste', (e) => this.handleGlobalPaste(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                this.handlePaste();
            }
        });
    }

    async handlePaste() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        await this.processImage(blob);
                        return;
                    }
                }
            }
            this.showError('No image found in clipboard. Please copy an image first.');
        } catch (error) {
            console.error('Paste error:', error);
            this.showError('Failed to read from clipboard. Please try uploading a file instead.');
        }
    }

    handleGlobalPaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                this.processImage(file);
                return;
            }
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file);
        } else {
            this.showError('Please select a valid image file.');
        }
        // Reset file input
        e.target.value = '';
    }

    async processImage(file) {
        try {
            this.hideError();
            this.showLoading();

            // Display the original image
            const imageUrl = URL.createObjectURL(file);
            this.originalImage.src = imageUrl;
            this.originalImage.onload = () => URL.revokeObjectURL(imageUrl);

            // Decode QR code
            const result = await this.decodeQRCode(file);
            
            if (result) {
                this.displayResult(result);
            } else {
                this.showError('No QR code found in the image. Please try with a different image.');
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showError('Failed to process the image. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async decodeQRCode(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Decode QR code using jsQR
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                
                resolve(code ? code.data : null);
            };
            
            img.onerror = () => resolve(null);
            img.src = URL.createObjectURL(file);
        });
    }

    displayResult(content) {
        this.qrContent.textContent = content;
        this.qrContent.classList.add('has-content');
        this.resultSection.style.display = 'grid';
        this.resultSection.classList.add('success');
        
        // Scroll to result
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove success animation after delay
        setTimeout(() => {
            this.resultSection.classList.remove('success');
        }, 600);
    }

    async startCamera() {
        try {
            this.hideError();
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            this.cameraVideo.srcObject = this.stream;
            this.cameraSection.style.display = 'block';
            this.isCameraActive = true;
            
            // Start continuous scanning
            this.startContinuousScanning();
            
        } catch (error) {
            console.error('Camera error:', error);
            this.showError('Failed to access camera. Please check permissions and try again.');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.cameraSection.style.display = 'none';
        this.isCameraActive = false;
        this.stopContinuousScanning();
    }

    startContinuousScanning() {
        this.scanInterval = setInterval(() => {
            if (this.isCameraActive) {
                this.scanFromCamera();
            }
        }, 1000); // Scan every second
    }

    stopContinuousScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }

    scanFromCamera() {
        if (!this.isCameraActive || this.cameraVideo.videoWidth === 0) return;

        const canvas = this.cameraCanvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.cameraVideo.videoWidth;
        canvas.height = this.cameraVideo.videoHeight;
        
        ctx.drawImage(this.cameraVideo, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            this.stopCamera();
            this.displayResult(code.data);
            
            // Show the captured frame as the original image
            canvas.toBlob((blob) => {
                const imageUrl = URL.createObjectURL(blob);
                this.originalImage.src = imageUrl;
                this.originalImage.onload = () => URL.revokeObjectURL(imageUrl);
            });
        }
    }

    captureFromCamera() {
        this.scanFromCamera();
    }

    async copyContent() {
        const content = this.qrContent.textContent;
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            this.showCopySuccess();
        } catch (error) {
            console.error('Copy error:', error);
            this.showError('Failed to copy to clipboard.');
        }
    }

    showCopySuccess() {
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Copied!
        `;
        this.copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.style.background = '#28a745';
        }, 2000);
    }

    showLoading() {
        this.pasteBtn.innerHTML = '<div class="loading"></div> Processing...';
        this.pasteBtn.disabled = true;
    }

    hideLoading() {
        this.pasteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Paste Image
        `;
        this.pasteBtn.disabled = false;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize the QR Code Reader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeReader();
});

// Handle page visibility changes to stop camera when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const qrReader = window.qrReader;
        if (qrReader && qrReader.isCameraActive) {
            qrReader.stopCamera();
        }
    }
}); 
