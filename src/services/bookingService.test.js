import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from './api';
import {
  cancelBooking,
  downloadBookingPdf,
  downloadBookingsCsv,
  initializeMpesaPayment,
} from './bookingService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('booking service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels a booking through the booking API', async () => {
    const result = { success: true, booking: { _id: 'booking-123', bookingStatus: 'cancelled' } };
    API.patch.mockResolvedValue({ data: result });

    await expect(cancelBooking('booking-123')).resolves.toEqual(result);

    expect(API.patch).toHaveBeenCalledWith('/bookings/booking-123/cancel');
  });

  it('initializes an M-Pesa payment through the backend payment API', async () => {
    const result = { message: 'M-Pesa payment prompt sent', checkoutRequestId: 'checkout-123' };
    API.post.mockResolvedValue({ data: result });

    await expect(initializeMpesaPayment('booking-123', '0712345678')).resolves.toEqual(result);

    expect(API.post).toHaveBeenCalledWith('/payments/mpesa/initialize', {
      bookingId: 'booking-123',
      phoneNumber: '0712345678',
    });
  });

  it('downloads a booking pdf from the export API', async () => {
    const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
    API.get.mockResolvedValue({ data: blob });

    const result = await downloadBookingPdf('booking-123');

    expect(API.get).toHaveBeenCalledWith('/exports/pdf/booking-123', { responseType: 'blob' });
    expect(result).toBe(blob);
  });

  it('downloads a csv report from the export API', async () => {
    const blob = new Blob(['name,amount\nTest,1000'], { type: 'text/csv' });
    API.get.mockResolvedValue({ data: blob });

    const result = await downloadBookingsCsv();

    expect(API.get).toHaveBeenCalledWith('/exports/csv', { responseType: 'blob' });
    expect(result).toBe(blob);
  });
});
