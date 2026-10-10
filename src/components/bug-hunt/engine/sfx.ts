/* Tiny synthesised sound effects. Nothing loads; the AudioContext starts on the first tap. */

export class Sfx {
  on = true;
  private ac: AudioContext | null = null;
  private lastBonk = 0;

  private ctx() {
    if (!this.on) return null;
    if (!this.ac) {
      try {
        this.ac = new AudioContext();
      } catch {
        this.on = false;
        return null;
      }
    }
    if (this.ac.state === "suspended") void this.ac.resume();
    return this.ac;
  }

  /** Call from a user gesture so later sounds are allowed to play. */
  unlock() {
    this.ctx();
  }

  private tone(freq: number, to: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    const ac = this.ctx();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number, delay = 0) {
    const ac = this.ctx();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(ac.destination);
    src.start(t);
  }

  twang(power: number) {
    this.tone(180 + power * 160, 70, 0.28, "triangle", 0.18);
    this.noise(0.06, 0.25, 2400);
  }

  bonk(speed: number) {
    const now = performance.now();
    if (now - this.lastBonk < 45) return;
    this.lastBonk = now;
    const v = Math.min(1, speed / 1200);
    this.tone(260 + v * 260, 120, 0.09, "sine", 0.04 + v * 0.12);
  }

  ting() {
    this.tone(1900, 1500, 0.35, "sine", 0.08);
    this.tone(2850, 2500, 0.25, "sine", 0.04);
  }

  squish() {
    this.noise(0.2, 0.5, 700);
    this.tone(520, 70, 0.22, "square", 0.06);
  }

  click() {
    this.tone(2200, 1800, 0.03, "square", 0.05);
  }

  hacked() {
    [880, 660, 440, 330, 220, 110].forEach((f, i) => this.tone(f, f * 0.98, 0.12, "square", 0.06, i * 0.09));
    this.noise(0.9, 0.18, 3000, 0.1);
  }

  dispose() {
    void this.ac?.close();
    this.ac = null;
  }
}
