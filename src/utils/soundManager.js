let soundEnabled = true;

// Pre-load sound settings from localStorage if available
try {
  const localData = localStorage.getItem('frida-data');
  if (localData) {
    const parsed = JSON.parse(localData);
    if (parsed && typeof parsed.soundEnabled === 'boolean') {
      soundEnabled = parsed.soundEnabled;
    }
  }
} catch (e) {
  console.error("Failed to load soundEnabled from localStorage:", e);
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
}

export function getSoundEnabled() {
  return soundEnabled;
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 🔴 Sonido "Otra vez" (Fallo):
 * Un tono doble corto y descendente, sutil y opaco (onda triangle).
 */
export function playAgain() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Primer tono (220Hz -> 160Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.12);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Segundo tono descendente con un retraso (180Hz -> 130Hz)
    const delay = 0.15;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(180, now + delay);
    osc2.frequency.exponentialRampToValueAtTime(130, now + delay + 0.15);

    gain2.gain.setValueAtTime(0.001, now + delay);
    gain2.gain.linearRampToValueAtTime(0.15, now + delay + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.16);
  } catch (error) {
    console.error('Failed to play "Again" sound:', error);
  }
}

/**
 * 🟡 Sonido "Bien" (Éxito normal):
 * Un "plip" sutil, limpio y de tono medio-alto (onda sine) de corta duración.
 */
export function playSuccess() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587, now); // D5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08); // A4

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.20, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (error) {
    console.error('Failed to play "Success" sound:', error);
  }
}

/**
 * 🔵 Sonido "Fácil" (Gran éxito):
 * Ráfaga de dos notas ascendentes armónicas y brillantes (E5 -> A5).
 */
export function playEasy() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Nota 1 (E5, 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Nota 2 (A5, 880Hz, con leve solapamiento en t + 0.06s)
    const delay = 0.06;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + delay);

    gain2.gain.setValueAtTime(0.001, now + delay);
    gain2.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.15);
  } catch (error) {
    console.error('Failed to play "Easy" sound:', error);
  }
}

/**
 * 🎉 Sonido de "Mazo Completado" (Celebración):
 * Un arpegio armónico ascendente, relajante y alegre (C major 7).
 */
export function playComplete() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Arpegio de C4, E4, G4, B4, C5, E5, G5
    const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 784.00];

    notes.forEach((freq, idx) => {
      const delay = idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.85);
    });
  } catch (error) {
    console.error('Failed to play "Complete" sound:', error);
  }
}
