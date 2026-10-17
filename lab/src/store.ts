// Ratings storage: the artifact's shared database when available (so Claude
// can read the results), otherwise this browser only.

export interface RatingDoc {
  createdAt: string;
  raterId: string | null;
  labVersion: string;
  engineVersion: string;
  mode: "entdecken" | "blindtest" | "duell";
  styleId: string;
  variantId: string;
  artist: string;
  variantName: string;
  key: string;
  keyId: string;
  bpm: number;
  bars: number;
  seed: number;
  laneSeeds: Record<string, number>;
  progression: string;
  degrees: string;
  rhythms: Record<string, string>;
  sounds: Record<string, string>;
  soundMode: "style" | "neutral";
  muted: string[];
  rating: number | null;
  issues: string[];
  comment: string;
  guess: string | null;
  correct: boolean | null;
  /** How it was heard: as a loop or in song form (from lab 0.3). */
  form?: "loop" | "song";
  /** Lead sung by the rater's own voice recording (from lab 0.3). */
  ownVoice?: boolean;
  /** Duel (from lab 0.5): which comparison, which version won ("a" = newer), and whether version 1 was "a". */
  duelId?: string;
  winner?: "a" | "b" | "tie";
  order?: "ab" | "ba";
}

export type StoredRating = RatingDoc & { id: string };
export type StoreStatus = "connecting" | "online" | "local";
export type SaveResult = "saved" | "declined" | "unavailable" | "error";

const LOCAL_KEY = "projectx-hoerlabor-ratings";

function readLocal(): StoredRating[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as StoredRating[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: StoredRating[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // storage blocked: keep in memory only
  }
}

export class Store {
  status: StoreStatus = "connecting";
  ratings: StoredRating[] = [];
  raterId: string | null = null;
  private db: any = null;
  private downloads: any = null;
  private unsubscribe: (() => void) | null = null;
  onChange: () => void = () => {};

  async init(): Promise<void> {
    const claude = window.claude;
    if (!claude?.use) {
      this.goLocal();
      return;
    }
    const safeUse = (name: string) => claude.use(name).catch(() => null);
    const [db, user, downloads] = await Promise.all([safeUse("db"), safeUse("user"), safeUse("downloads")]);
    this.downloads = downloads;
    if (user) {
      try {
        this.raterId = await user.id();
      } catch {
        this.raterId = null;
      }
    }
    if (!db) {
      this.goLocal();
      return;
    }
    this.db = db;
    this.status = "online";
    this.unsubscribe = db
      .collection("ratings")
      .orderBy("createdAt", "desc")
      .limit(1000)
      .onSnapshot(
        (snap: any) => {
          this.ratings = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as RatingDoc) }));
          this.onChange();
        },
        () => this.goLocal(),
      );
    this.onChange();
  }

  private goLocal(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.db = null;
    this.status = "local";
    this.ratings = readLocal();
    this.onChange();
  }

  async add(doc: RatingDoc): Promise<string> {
    if (this.db) {
      try {
        const ref = await this.db.collection("ratings").add(doc);
        return ref.id as string;
      } catch (e: any) {
        if (e?.code === "unavailable") {
          await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
          const ref = await this.db.collection("ratings").add(doc);
          return ref.id as string;
        }
        throw e;
      }
    }
    const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    this.ratings = [{ id, ...doc }, ...this.ratings];
    writeLocal(this.ratings);
    this.onChange();
    return id;
  }

  async update(id: string, patch: Partial<RatingDoc>): Promise<void> {
    if (this.db && !id.startsWith("local-")) {
      await this.db.doc(`ratings/${id}`).update(patch);
      return;
    }
    this.ratings = this.ratings.map((r) => (r.id === id ? { ...r, ...patch } : r));
    writeLocal(this.ratings);
    this.onChange();
  }

  get canDownload(): boolean {
    return !!this.downloads;
  }

  async saveFile(filename: string, data: Uint8Array | string): Promise<SaveResult> {
    if (!this.downloads) return "unavailable";
    try {
      const payload = typeof data === "string" ? data : new Blob([data as BlobPart]);
      await this.downloads.save({ filename, data: payload });
      return "saved";
    } catch (e: any) {
      if (e?.code === "declined") return "declined";
      if (["unavailable", "not_granted", "capability_disabled", "capability_removed", "extension_not_enabled"].includes(e?.code)) {
        return "unavailable";
      }
      return "error";
    }
  }
}

export function errorText(e: any): string {
  switch (e?.code) {
    case "invalid_argument":
      return "Speichern abgelehnt: Mit deinem Zugang kannst du hier nichts speichern.";
    case "quota_exceeded":
      return "Der Speicher ist voll. Sag mir Bescheid, dann räume ich alte Bewertungen auf.";
    case "resource_exhausted":
      return "Zu viele Speichervorgänge auf einmal. Warte kurz und versuch es noch einmal.";
    case "revoked":
      return "Der Zugriff wurde entzogen. Lade die Seite neu.";
    default:
      return "Speichern hat nicht geklappt. Versuch es gleich noch einmal.";
  }
}
