import { publicPath } from "./publicPath";

export type BattleCueKind = "airCombat" | "aircraft" | "bombing" | "cannon" | "dive" | "melee" | "strafing" | "combined";

type SfxKey = "cannon" | "explosion" | "aircraft" | "melee" | "strafing";

type SfxClip = {
  src: string;
  volume: number;
  offset?: number;
  maxDuration?: number;
};

const defaultMusicSource = publicPath("/audio/semper-fidelis-march.mp3");

const sfxClips: Record<SfxKey, SfxClip> = {
  cannon: {
    src: publicPath("/audio/sfx/cannon-howitzer.mp3"),
    volume: 0.34,
    maxDuration: 3.2
  },
  explosion: {
    src: publicPath("/audio/sfx/explosion-heavy.mp3"),
    volume: 0.28,
    maxDuration: 4.6
  },
  aircraft: {
    src: publicPath("/audio/sfx/airplane-in-flight.mp3"),
    volume: 0.34,
    offset: 4.5,
    maxDuration: 5.2
  },
  melee: {
    src: publicPath("/audio/sfx/swords-clashing.mp3"),
    volume: 0.34,
    offset: 3.1,
    maxDuration: 3.2
  },
  strafing: {
    src: publicPath("/audio/sfx/machine-gun-vulcan.mp3"),
    volume: 0.3,
    offset: 1.15,
    maxDuration: 2.6
  }
};

export class WarScore {
  private music: HTMLAudioElement | null = null;
  private activeSfx = new Set<HTMLAudioElement>();
  private stopTimers = new Set<number>();

  constructor(private readonly musicSource = defaultMusicSource) {}

  async start() {
    this.ensureMusic();

    if (!this.music) {
      return;
    }

    try {
      await this.music.play();
    } catch {
      // Browsers may reject playback until a user gesture. The next control click will retry.
    }
  }

  async pause() {
    if (this.music) {
      this.music.pause();
    }
    this.stopSfx();
  }

  async stop() {
    this.stopSfx();

    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.music.src = "";
      this.music = null;
    }
  }

  async playBattleCue(kind: BattleCueKind = "combined") {
    if (typeof Audio === "undefined") {
      return;
    }

    if (kind === "cannon" || kind === "combined") {
      void this.playClip("cannon");
      if (kind === "combined") {
        window.setTimeout(() => {
          void this.playClip("explosion");
        }, 420);
      }
    }

    if (kind === "bombing") {
      void this.playClip("explosion");
      window.setTimeout(() => {
        void this.playClip("aircraft");
      }, 180);
    }

    if (kind === "aircraft" || kind === "dive" || kind === "airCombat" || kind === "combined") {
      window.setTimeout(() => {
        void this.playClip("aircraft");
      }, 140);
    }

    if (kind === "airCombat" || kind === "strafing" || kind === "combined") {
      window.setTimeout(() => {
        void this.playClip("strafing");
      }, 760);
    }

    if (kind === "melee") {
      void this.playClip("melee");
    }
  }

  private ensureMusic() {
    if (this.music || typeof Audio === "undefined") {
      return;
    }

    const music = new Audio(publicPath(this.musicSource));
    music.loop = true;
    music.preload = "auto";
    music.volume = 0.72;
    this.music = music;
  }

  private async playClip(key: SfxKey) {
    const clip = sfxClips[key];
    const audio = new Audio(clip.src);
    audio.preload = "auto";
    audio.volume = clip.volume;

    if (clip.offset) {
      audio.currentTime = clip.offset;
    }

    this.activeSfx.add(audio);
    const cleanup = () => this.activeSfx.delete(audio);
    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("pause", cleanup, { once: true });

    if (clip.maxDuration) {
      const stopTimer = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        this.stopTimers.delete(stopTimer);
      }, clip.maxDuration * 1000);
      this.stopTimers.add(stopTimer);
    }

    try {
      await audio.play();
    } catch {
      cleanup();
    }
  }

  private stopSfx() {
    for (const timer of this.stopTimers) {
      window.clearTimeout(timer);
    }
    this.stopTimers.clear();

    for (const audio of this.activeSfx) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.activeSfx.clear();
  }
}
