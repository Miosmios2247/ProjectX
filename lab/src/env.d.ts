// Minimal typing for the globals the lab page uses.

type ToneLib = typeof import("tone");

interface ClaudeHot {
  snapshot?(fn: () => unknown): void;
  ready?(start: (data: unknown) => void): void;
  data?: unknown;
}

interface ClaudeRuntime {
  use(name: string): Promise<any>;
  hot?: ClaudeHot;
}

interface Window {
  Tone?: ToneLib;
  claude?: ClaudeRuntime;
}

interface Navigator {
  audioSession?: { type: string };
}
