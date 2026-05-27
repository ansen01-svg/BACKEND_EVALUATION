import crypto from 'crypto';

interface HashableEvent {
  productId: string;
  sequenceNumber: number;
  type: string;
  timestamp: Date | string;
  location: string;
  performedBy: string;
  metadata: Record<string, unknown>;
}

/**
 * Computes a SHA-256 hash for an event, incorporating the previous event's hash.
 * This forms a blockchain-like chain where tampering with any event
 * invalidates all subsequent hashes.
 */
export function computeEventHash(event: HashableEvent, previousHash: string | null): string {
  const payload = JSON.stringify({
    productId: event.productId,
    sequenceNumber: event.sequenceNumber,
    type: event.type,
    timestamp: new Date(event.timestamp).toISOString(),
    location: event.location,
    performedBy: event.performedBy,
    metadata: event.metadata,
    previousHash: previousHash || '0',
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}
