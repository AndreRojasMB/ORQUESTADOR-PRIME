// src/whatsapp/rateLimiter.ts
// In-memory sliding window rate limiter per senderHash.
// No external dependencies — pure logic.

const WINDOW_MS = 3_600_000; // 1 hour

export class WhatsAppRateLimiter {
  private readonly maxPerHour: number;
  private readonly windows = new Map<string, number[]>();

  constructor(maxPerHour: number) {
    this.maxPerHour = maxPerHour;
  }

  /** Returns true if the sender is within budget, false if rate-limited. */
  isAllowed(senderHash: string): boolean {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;

    let timestamps = this.windows.get(senderHash);
    if (!timestamps) {
      timestamps = [];
      this.windows.set(senderHash, timestamps);
    }

    // Prune expired entries
    const firstValid = timestamps.findIndex((t) => t > cutoff);
    if (firstValid > 0) {
      timestamps.splice(0, firstValid);
    } else if (firstValid === -1) {
      timestamps.length = 0;
    }

    if (timestamps.length >= this.maxPerHour) {
      return false;
    }

    timestamps.push(now);
    return true;
  }

  /** Clears all state. */
  reset(): void {
    this.windows.clear();
  }
}

// ─── Factory / getter ────────────────────────────────────────────
// Recreates the limiter if maxPerHour changes between calls.

let _instance: WhatsAppRateLimiter | null = null;
let _lastMax = 0;

export function getRateLimiter(maxPerHour: number): WhatsAppRateLimiter {
  if (!_instance || _lastMax !== maxPerHour) {
    _instance = new WhatsAppRateLimiter(maxPerHour);
    _lastMax = maxPerHour;
  }
  return _instance;
}
