// utils/test-data.factory.ts
import envConfig from '../config/env.config';
// Type-only import: bookingClient imports this file at runtime
import type { BookingDates } from '../api/bookingClient';

// ── Strict types — zero `any` ────────────────────────────────

export type UserType = keyof typeof envConfig.users;

export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

// ── Users ────────────────────────────────────────────────────

export const UserFactory = {
  get(type: string): UserCredentials {
    if (!Object.prototype.hasOwnProperty.call(envConfig.users, type)) {
      const known = Object.keys(envConfig.users).join(', ');
      throw new Error(`Unknown user type "${type}". Known types: ${known}`);
    }
    return envConfig.users[type as UserType];
  },

  emptyUsername(): UserCredentials {
    return { username: '', password: envConfig.users.standard.password };
  },

  emptyPassword(): UserCredentials {
    return { username: envConfig.users.standard.username, password: '' };
  },
};

// ── Bookings ─────────────────────────────────────────────────

const isoDate = (daysFromToday: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
};

// Relative to today so test data never drifts into the past
export const BookingDatesFactory = {
  upcoming(startInDays = 30, nights = 6): BookingDates {
    return { checkin: isoDate(startInDays), checkout: isoDate(startInDays + nights) };
  },
};
