// api/bookingClient.ts
import { APIRequestContext, APIResponse } from '@playwright/test';
import { getLogger } from '../utils/logger';
import { BookingDatesFactory } from '../utils/test-data.factory';

const log = getLogger('BookingClient');

// ── Strict interfaces ────────────────────────────────────────

export interface BookingDates {
  checkin:  string;
  checkout: string;
}

export interface Booking {
  firstname:       string;
  lastname:        string;
  totalprice:      number;
  depositpaid:     boolean;
  bookingdates:    BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking:   Booking;
}

export interface BookingId {
  bookingid: number;
}

export interface AuthResponse {
  token: string;
}

export type PartialBooking = Partial<Booking>;

// ── Client ───────────────────────────────────────────────────

export class BookingClient {
  private readonly baseUrl = 'https://restful-booker.herokuapp.com';
  private token: string | undefined;

  constructor(private readonly request: APIRequestContext) {}

  // ── Auth ─────────────────────────────────────────────────

  async authenticate(username = 'admin', password = 'password123'): Promise<void> {
    log.info('Authenticating with Booking API');
    const response = await this.request.post(`${this.baseUrl}/auth`, {
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    });
    this.assertStatus(response, 200, 'Auth');
    const body = await response.json() as AuthResponse;
    this.token = body.token;
    log.info('Authentication successful');
  }

  // ── CRUD ─────────────────────────────────────────────────

  async getAllBookings(): Promise<APIResponse> {
    log.info('GET /booking');
    return this.request.get(`${this.baseUrl}/booking`, {
      headers: this.jsonHeaders(),
    });
  }

  async getBooking(id: number): Promise<APIResponse> {
    log.info({ id }, 'GET /booking/:id');
    return this.request.get(`${this.baseUrl}/booking/${id}`, {
      headers: this.jsonHeaders(),
    });
  }

  async createBooking(booking: Booking): Promise<APIResponse> {
    log.info({ booking }, 'POST /booking');
    return this.request.post(`${this.baseUrl}/booking`, {
      data: booking,
      headers: this.jsonHeaders(),
    });
  }

  async createBookingMissingField(): Promise<APIResponse> {
    log.info('POST /booking with missing firstname');
    return this.request.post(`${this.baseUrl}/booking`, {
      data: {
        lastname:     'Test',
        totalprice:   100,
        depositpaid:  false,
        bookingdates: BookingDatesFactory.upcoming(30, 1),
      },
      headers: this.jsonHeaders(),
    });
  }

  async updateBooking(id: number, booking: Booking): Promise<APIResponse> {
    log.info({ id, booking }, 'PUT /booking/:id');
    return this.request.put(`${this.baseUrl}/booking/${id}`, {
      data: booking,
      headers: this.authHeaders(),
    });
  }

  async partialUpdateBooking(id: number, partial: PartialBooking): Promise<APIResponse> {
    log.info({ id, partial }, 'PATCH /booking/:id');
    return this.request.patch(`${this.baseUrl}/booking/${id}`, {
      data: partial,
      headers: this.authHeaders(),
    });
  }

  async deleteBooking(id: number): Promise<APIResponse> {
    log.info({ id }, 'DELETE /booking/:id');
    return this.request.delete(`${this.baseUrl}/booking/${id}`, {
      headers: this.authHeaders(),
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  private jsonHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    };
  }

  private authHeaders(): Record<string, string> {
    if (!this.token) throw new Error('Not authenticated — call authenticate() first');
    return {
      ...this.jsonHeaders(),
      'Cookie': `token=${this.token}`,
    };
  }

  private assertStatus(response: APIResponse, expected: number, context: string): void {
    if (response.status() !== expected) {
      log.error({ context, expected, actual: response.status() }, 'Unexpected status');
      throw new Error(`${context}: expected ${expected}, got ${response.status()}`);
    }
  }
}
