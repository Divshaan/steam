/* ============================================
   STEAM CORP — VAULT WEBCAM EXPERIENCE
   Face detection, canvas compositing, screenshot, share
   ============================================ */

(function () {
  'use strict';

  // --- CONFIG ---
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
  const DETECTION_OPTIONS = { inputSize: 224, scoreThreshold: 0.5 };

  // --- DOM ELEMENTS ---
  const promptSection = document.getElementById('vault-prompt');
  const loadingSection = document.getElementById('vault-loading');
  const experienceSection = document.getElementById('vault-experience');
  const errorSection = document.getElementById('vault-error');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');
  const video = document.getElementById('vault-video');
  const canvas = document.getElementById('vault-canvas');
  const placardText = document.getElementById('placard-text');
  const placardSub = document.getElementById('placard-sub');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const twitterBtn = document.getElementById('twitter-btn');
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const toast = document.getElementById('vault-toast');

  const ctx = canvas.getContext('2d');

  // --- STATE ---
  let stream = null;
  let animFrameId = null;
  let hasDetectedFace = false;
  let unitNumber = 0;
  let barsImage = null;
  let faceBox = null;
  let detectEveryNFrames = 1;
  let frameCount = 0;

  // --- BARS OVERLAY ---
  // Generate iron bars PNG via canvas
  function generateBarsOverlay(w, h) {
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext('2d');

    offCtx.strokeStyle = '#2a2a2a';
    offCtx.lineWidth = Math.max(w * 0.018, 4);
    offCtx.lineCap = 'round';

    // Diagonal bars (top-left to bottom-right)
    const barSpacing = w * 0.11;
    for (let offset = -h; offset < w + h; offset += barSpacing) {
      offCtx.beginPath();
      offCtx.moveTo(offset, 0);
      offCtx.lineTo(offset + h * 0.6, h);
      offCtx.stroke();
    }

    // Cross bars (opposite diagonal)
    offCtx.lineWidth = Math.max(w * 0.012, 3);
    offCtx.strokeStyle = '#222222';
    const crossSpacing = h * 0.25;
    for (let y = crossSpacing; y < h; y += crossSpacing) {
      offCtx.beginPath();
      offCtx.moveTo(0, y);
      offCtx.lineTo(w, y - h * 0.15);
      offCtx.stroke();
    }

    // Metallic highlight pass
    offCtx.strokeStyle = 'rgba(180, 180, 180, 0.08)';
    offCtx.lineWidth = Math.max(w * 0.006, 2);
    for (let offset = -h; offset < w + h; offset += barSpacing) {
      offCtx.beginPath();
      offCtx.moveTo(offset + 2, 0);
      offCtx.lineTo(offset + h * 0.6 + 2, h);
      offCtx.stroke();
    }

    const img = new Image();
    img.src = offscreen.toDataURL('image/png');
    return img;
  }

  // --- UI STATE MANAGEMENT ---
  function showSection(section) {
    [promptSection, loadingSection, experienceSection, errorSection].forEach(s => {
      s.classList.remove('active');
      if (s === promptSection) s.style.display = 'none';
    });
    if (section === promptSection) {
      section.style.display = '';
    } else {
      section.classList.add('active');
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function updateLoadingProgress(percent) {
    loadingBarFill.style.width = percent + '%';
  }

  // --- FACE DETECTION SETUP ---
  function waitForFaceApi() {
    return new Promise((resolve) => {
      if (typeof faceapi !== 'undefined') return resolve();
      const check = setInterval(() => {
        if (typeof faceapi !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  async function loadModels() {
    updateLoadingProgress(10);
    await waitForFaceApi();
    updateLoadingProgress(20);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    updateLoadingProgress(80);
  }

  // --- CAMERA ---
  async function startCamera() {
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // --- CANVAS COMPOSITING ---
  function setupCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Generate bars overlay to match canvas size
    barsImage = generateBarsOverlay(canvas.width, canvas.height);
  }

  function renderFrame() {
    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw mirrored B&W webcam frame
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.filter = 'grayscale(1) contrast(1.2)';
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = 'none';
    ctx.restore();

    // 2. Dark vignette
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 3. Iron bars overlay (if face detected)
    if (hasDetectedFace && barsImage && barsImage.complete) {
      ctx.globalAlpha = 0.7;
      ctx.drawImage(barsImage, 0, 0, w, h);
      ctx.globalAlpha = 1.0;
    }

    // 4. Bottom gradient (for placard area)
    const bottomGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // 5. Steam Corp logo text (top-right)
    ctx.save();
    ctx.font = `bold ${Math.max(w * 0.018, 10)}px 'Oswald', sans-serif`;
    ctx.fillStyle = 'rgba(198, 212, 223, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('STEAM CORP', w - 15, 25);
    ctx.font = `${Math.max(w * 0.012, 8)}px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(198, 212, 223, 0.3)';
    ctx.fillText('PRIVATE VAULT', w - 15, 42);
    ctx.restore();

    // 6. Unit placard on canvas (for screenshots)
    if (hasDetectedFace) {
      ctx.save();
      ctx.font = `bold ${Math.max(w * 0.03, 14)}px 'Share Tech Mono', monospace`;
      ctx.fillStyle = '#66c0f4';
      ctx.textAlign = 'center';
      ctx.fillText(`UNIT ${unitNumber} — ACQUIRED`, w / 2, h - 45);

      ctx.font = `${Math.max(w * 0.015, 9)}px 'Share Tech Mono', monospace`;
      ctx.fillStyle = 'rgba(198, 212, 223, 0.5)';
      ctx.fillText('STEAM CORP PRIVATE VAULT — RESTRICTED ACCESS', w / 2, h - 20);
      ctx.restore();
    }

    // 7. Timestamp (bottom-left)
    ctx.save();
    ctx.font = `${Math.max(w * 0.013, 8)}px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(198, 212, 223, 0.35)';
    ctx.textAlign = 'left';
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').split('.')[0];
    ctx.fillText(ts, 15, h - 15);
    ctx.restore();
  }

  // --- DETECTION LOOP ---
  async function detectionLoop() {
    frameCount++;

    // Only run detection every N frames for performance
    if (frameCount % detectEveryNFrames === 0) {
      try {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions(DETECTION_OPTIONS)
        );

        if (detection) {
          faceBox = detection.box;

          if (!hasDetectedFace) {
            // First detection — trigger events
            hasDetectedFace = true;
            unitNumber = Math.floor(Math.random() * 900) + 100;

            // Update placard
            placardText.textContent = `UNIT ${unitNumber} — ACQUIRED`;
            placardSub.textContent = 'Asset processed and logged to vault';

            // Play sound
            SoundManager.playBarsSlam();
            SoundManager.startAmbientHum();

            // Enable buttons
            downloadBtn.disabled = false;
            twitterBtn.disabled = false;
            if (shareBtn) shareBtn.disabled = false;

            // Placard flash animation
            placardText.style.animation = 'none';
            placardText.offsetHeight; // trigger reflow
            placardText.style.animation = 'fadeIn 0.5s ease forwards';
          }
        }
      } catch (err) {
        // Detection error — skip frame, continue
      }
    }

    renderFrame();
    animFrameId = requestAnimationFrame(detectionLoop);
  }

  // --- SCREENSHOT ---
  function downloadScreenshot() {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `steam-corp-unit-${unitNumber}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast('IMAGE SAVED TO DEVICE');
    }, 'image/png');
  }

  // --- SHARE ---
  async function shareNative() {
    if (!navigator.canShare) {
      downloadScreenshot();
      showToast('DOWNLOAD IMAGE AND SHARE MANUALLY');
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `steam-corp-unit-${unitNumber}.png`, { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Steam Corp — OWNED',
            text: `UNIT ${unitNumber} — ACQUIRED. Own Everything. Owe Nothing. #SteamOwned`
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            showToast('SHARE CANCELLED');
          }
        }
      } else {
        downloadScreenshot();
        showToast('DOWNLOAD IMAGE AND SHARE MANUALLY');
      }
    }, 'image/png');
  }

  function shareToTwitter() {
    const text = encodeURIComponent(
      `I've been processed. UNIT ${unitNumber} — ACQUIRED.\n\nOwn Everything. Owe Nothing.\n#SteamOwned #OwnEverything`
    );
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  }

  // --- MAIN FLOW ---
  async function startExperience() {
    promptSection.style.display = 'none';
    loadingSection.classList.add('active');
    updateLoadingProgress(5);

    try {
      // Init audio on user gesture
      SoundManager.init();

      // Load face detection models
      updateLoadingProgress(10);
      await loadModels();
      updateLoadingProgress(85);

      // Start camera
      await startCamera();
      updateLoadingProgress(95);

      // Setup canvas
      setupCanvas();
      updateLoadingProgress(100);

      // Transition to experience
      setTimeout(() => {
        showSection(experienceSection);
        experienceSection.classList.add('active');

        // Start detection loop
        detectionLoop();
      }, 500);

    } catch (err) {
      console.error('Vault error:', err);
      showSection(errorSection);
      errorSection.classList.add('active');

      const errorTitle = document.getElementById('error-title');
      const errorText = document.getElementById('error-text');

      if (err.name === 'NotAllowedError') {
        errorTitle.textContent = 'ACCESS DENIED';
        errorText.textContent = 'Camera permission was denied. Grant access to proceed with processing.';
      } else if (err.name === 'NotFoundError') {
        errorTitle.textContent = 'NO CAPTURE DEVICE';
        errorText.textContent = 'No camera detected on this device. A camera is required for biometric processing.';
      } else if (err.name === 'NotReadableError') {
        errorTitle.textContent = 'DEVICE OCCUPIED';
        errorText.textContent = 'Camera is in use by another application. Close other apps and retry.';
      } else {
        errorTitle.textContent = 'SYSTEM ERROR';
        errorText.textContent = 'An unexpected error occurred during initialization. Please retry.';
      }
    }
  }

  // --- EVENT LISTENERS ---
  startBtn.addEventListener('click', startExperience);

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      stopCamera();
      hasDetectedFace = false;
      faceBox = null;
      showSection(promptSection);
      promptSection.style.display = '';
    });
  }

  downloadBtn.addEventListener('click', downloadScreenshot);

  if (shareBtn) {
    // Show share button only on mobile with Web Share API
    if (navigator.canShare) {
      shareBtn.style.display = '';
      shareBtn.addEventListener('click', shareNative);
    } else {
      shareBtn.style.display = 'none';
    }
  }

  twitterBtn.addEventListener('click', shareToTwitter);

  // Cleanup on page leave
  window.addEventListener('beforeunload', () => {
    stopCamera();
    SoundManager.stopAmbientHum();
  });

})();
