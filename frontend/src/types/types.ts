export enum UserRole {
  INTERNAL = "internal",
  PARTNER = "partner",
}

export enum EventType {
  MANUFACTURED = "manufactured",
  IN_TRANSIT = "in_transit",
  SHIPPED = "shipped",
  RECEIVED = "received",
  INSPECTED = "inspected",
  STORED = "stored",
  SOLD = "sold",
  RETURNED = "returned",
  RECYCLED = "recycled",
  RECALLED = "recalled",
  DISPOSED = "disposed",
}

export interface ProductEvent {
  _id: string;
  productId: string;
  sequenceNumber: number;
  type: EventType;
  timestamp: string;
  location: string;
  performedBy: string;
  metadata: Record<string, unknown>;
  previousHash: string | null;
  hash: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  partnerId: string;
  currentStatus: EventType;
  createdAt: string;
  updatedAt: string;
  events?: ProductEvent[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface VerificationResult {
  productId: string;
  productName: string;
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

export interface AuthResponse {
  status: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      partnerId?: string;
    };
  };
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.MANUFACTURED]: "Manufactured",
  [EventType.IN_TRANSIT]: "In Transit",
  [EventType.SHIPPED]: "Shipped",
  [EventType.RECEIVED]: "Received",
  [EventType.INSPECTED]: "Inspected",
  [EventType.STORED]: "Stored",
  [EventType.SOLD]: "Sold",
  [EventType.RETURNED]: "Returned",
  [EventType.RECYCLED]: "Recycled",
  [EventType.RECALLED]: "Recalled",
  [EventType.DISPOSED]: "Disposed",
};
