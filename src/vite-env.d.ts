/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Wake Lock API types
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface Navigator {
  readonly wakeLock?: WakeLock;
}

interface Window {
  storage: {
    get: (key: string) => Promise<{ value: string } | null>;
    set: (key: string, value: string) => Promise<void>;
  };
}
