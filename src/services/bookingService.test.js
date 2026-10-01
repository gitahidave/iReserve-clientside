import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from './api';
import { downloadBookingPdf, downloadBookingsCsv } from './bookingService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('booking export service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
