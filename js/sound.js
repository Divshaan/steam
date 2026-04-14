/* ============================================
   STEAM CORP — AUDIO MANAGER
   Synthesized sound effects via Web Audio API
   ============================================ */

const SoundManager = (function () {
  'use strict';

  let audioCtx = null;
  let initialized = false;

  function init() {
    if (initialized) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      initialized = true;
    } catch (e) {
      console.warn('Web Audio API not available');
    }
  }

  // Synthesize a metallic bars-slam impact
  function playBarsSlam() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // --- Layer 1: Low impact thud ---
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // --- Layer 2: Metallic ring ---
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(400, now);
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.3);

    // --- Layer 3: Noise burst (impact texture) ---
    const bufferSize = audioCtx.sampleRate * 0.2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 1;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + 0.2);

    // --- Layer 4: Secondary clang (delayed) ---
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(250, now + 0.08);
    osc3.frequency.exponentialRampToValueAtTime(100, now + 0.35);
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.setValueAtTime(0.2, now + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start(now + 0.08);
    osc3.stop(now + 0.5);
  }

  // Ambient low hum (optional, looping)
  let ambientSource = null;
  let ambientGain = null;

  function startAmbientHum() {
    if (!audioCtx) return;
    if (ambientSource) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // Low-frequency drone
    ambientSource = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    const ambientFilter = audioCtx.createBiquadFilter();

    ambientSource.type = 'sawtooth';
    ambientSource.frequency.value = 55;

    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.value = 120;

    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(0.04, now + 2);

    ambientSource.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);
    ambientSource.start(now);
  }

  function stopAmbientHum() {
    if (ambientSource) {
      const now = audioCtx.currentTime;
      ambientGain.gain.linearRampToValueAtTime(0, now + 1);
      ambientSource.stop(now + 1);
      ambientSource = null;
      ambientGain = null;
    }
  }

  return {
    init,
    playBarsSlam,
    startAmbientHum,
    stopAmbientHum
  };
})();
