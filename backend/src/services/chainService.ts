import { Event } from '../models';
import { computeEventHash } from '../utils/hash';

export interface VerificationResult {
  valid: boolean;
  totalEvents: number;
  checkedEvents: number;
  brokenAt?: {
    sequenceNumber: number;
    eventId: string;
    expected: string;
    actual: string;
  };
}

/**
 * Walks the entire event chain for a product and recomputes each hash
 * to verify the chain's integrity — identical to blockchain validation.
 */
export async function verifyEventChain(productId: string): Promise<VerificationResult> {
  const events = await Event.find({ productId })
    .sort({ sequenceNumber: 1 })
    .lean();

  if (events.length === 0) {
    return { valid: true, totalEvents: 0, checkedEvents: 0 };
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const previousHash = i === 0 ? null : events[i - 1].hash;

    // Verify the previousHash reference is correct
    if (event.previousHash !== previousHash) {
      return {
        valid: false,
        totalEvents: events.length,
        checkedEvents: i + 1,
        brokenAt: {
          sequenceNumber: event.sequenceNumber,
          eventId: event._id.toString(),
          expected: previousHash || 'null (genesis)',
          actual: event.previousHash || 'null',
        },
      };
    }

    // Recompute and verify the hash itself
    const recomputedHash = computeEventHash(
      {
        productId: event.productId.toString(),
        sequenceNumber: event.sequenceNumber,
        type: event.type,
        timestamp: event.timestamp,
        location: event.location,
        performedBy: event.performedBy,
        metadata: event.metadata,
      },
      previousHash
    );

    if (recomputedHash !== event.hash) {
      return {
        valid: false,
        totalEvents: events.length,
        checkedEvents: i + 1,
        brokenAt: {
          sequenceNumber: event.sequenceNumber,
          eventId: event._id.toString(),
          expected: recomputedHash,
          actual: event.hash,
        },
      };
    }
  }

  return {
    valid: true,
    totalEvents: events.length,
    checkedEvents: events.length,
  };
}
