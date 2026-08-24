export type CommunicationPayload = Record<string, string | number | boolean | null | undefined>;

export interface BookingCommunicationSnapshot {
  bookingId: string;
  consumerName: string;
  consumerEmail: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  timezone: string | null;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
}

export interface ReceiptSnapshot extends BookingCommunicationSnapshot {
  receiptNumber: string;
  receiptType: 'PAYMENT' | 'REFUND';
  taxAmount: number;
  taxName: string | null;
  paymentReference: string | null;
}
