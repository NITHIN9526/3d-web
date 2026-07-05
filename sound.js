// ============================================
// AMBIENT SOUND ENGINE — Web Audio API
// Synthesized ambient drone, no external files needed.
// Mirrors igloo.inc: muted by default, bottom-left toggle.
// ============================================

const SoundEngine = (() => {
    let ctx = null;         // AudioContext
    let masterGain = null;  // Master volume node
    let isOn = false;
    let nodes = [];         // All oscillators / sources to clean up

    // ── Build the ambient soundscape ────────────────────────────────────────
    const buildAmbience = () => {
        ctx = new (window.AudioContext || window.webkitAudioContext)();

        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);          // start silent
        masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2); // fade in
        masterGain.connect(ctx.destination);

        // ── Layer 1: Deep sub-drone (two detuned sines for width) ──────────
        const droneFreqs = [55, 55.2]; // A1, slightly detuned twin
        droneFreqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.35;
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            nodes.push(osc);
        });

        // ── Layer 2: Mid harmonic pad (five stacked sines, chord A-E-A) ───
        const padFreqs = [110, 165, 220, 277.2, 330];
        padFreqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            // Slow tremolo via LFO
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            lfo.type = 'sine';
            lfo.frequency.value = 0.08 + Math.random() * 0.06; // 0.08–0.14 Hz
            lfoGain.gain.value = 0.03;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            gain.gain.value = 0.04;
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            lfo.start();
            nodes.push(osc, lfo);
        });

        // ── Layer 3: High shimmer (triangle at 880 Hz, barely audible) ─────
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.value = 880;
        shimmerGain.gain.value = 0.008;
        shimmer.connect(shimmerGain);
        shimmerGain.connect(masterGain);
        shimmer.start();
        nodes.push(shimmer);

        // ── Layer 4: Very soft pink noise (adds warmth & texture) ──────────
        const bufferSize = ctx.sampleRate * 2; // 2-second looping buffer
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Paul Kellet's pink noise algorithm
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) / 7;
            b6 = white * 0.115926;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.015; // very subtle
        noiseSource.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSource.start();
        nodes.push(noiseSource);
    };

    // ── Tear down all nodes ─────────────────────────────────────────────────
    const destroyNodes = () => {
        nodes.forEach(n => { try { n.stop(); } catch (_) {} });
        nodes = [];
        if (ctx) {
            ctx.close();
            ctx = null;
        }
    };

    // ── Public toggle ───────────────────────────────────────────────────────
    const toggle = () => {
        if (!isOn) {
            buildAmbience();
            isOn = true;
        } else {
            // Fade out before destroy
            if (masterGain) {
                masterGain.gain.cancelScheduledValues(ctx.currentTime);
                masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
                masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
                setTimeout(destroyNodes, 1100);
            }
            isOn = false;
        }
        return isOn;
    };

    return { toggle, isOn: () => isOn };
})();

// ── Wire up the button ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn   = document.getElementById('sound-btn');
    const label = btn?.querySelector('.sound-label');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const nowOn = SoundEngine.toggle();
        btn.classList.toggle('sound-on', nowOn);
        btn.setAttribute('aria-pressed', String(nowOn));
        if (label) label.textContent = nowOn ? 'Sound On' : 'Sound Off';
    });
});
