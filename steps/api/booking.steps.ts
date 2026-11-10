// steps/api/booking.steps.ts
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect }                       from '@playwright/test';
import { ICustomWorld }                 from '../../support/world';
import { Booking }                      from '../../api/bookingClient';
import { getLogger }                    from '../../utils/logger';
import { BookingDatesFactory }          from '../../utils/test-data.factory';

const log = getLogger('BookingSteps');

// ── Given ────────────────────────────────────────────────────

Given('I am authenticated with the Booking API', async function (this: ICustomWorld) {
  await this.bookingClient!.authenticate();
});

Given('a booking exists for {string} {string}', async function (
  this: ICustomWorld,
  firstname: string,
  lastname: string,
) {
  log.info({ firstname, lastname }, 'Creating prerequisite booking');
  const response = await this.bookingClient!.createBooking({
    firstname,
    lastname,
    totalprice:   150,
    depositpaid:  true,
    bookingdates: BookingDatesFactory.upcoming(),
    additionalneeds: 'None',
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  this.bookingId = body.bookingid as number;
  log.info({ bookingId: this.bookingId }, 'Prerequisite booking created');
});

// ── When ─────────────────────────────────────────────────────

When('I request all bookings', async function (this: ICustomWorld) {
  this.lastResponse = await this.bookingClient!.getAllBookings();
});

When('I create a booking with the following details:', async function (
  this: ICustomWorld,
  table: DataTable,
) {
  const row     = table.hashes()[0];
  const booking: Booking = {
    firstname:       row.firstname,
    lastname:        row.lastname,
    totalprice:      parseInt(row.totalprice),
    depositpaid:     row.depositpaid === 'true',
    bookingdates:    BookingDatesFactory.upcoming(),
    additionalneeds: row.additionalneeds,
  };
  this.lastResponse = await this.bookingClient!.createBooking(booking);
  if (this.lastResponse.status() === 200) {
    const body        = await this.lastResponse.json();
    this.bookingId    = body.bookingid as number;
  }
});

When('I get the booking by id', async function (this: ICustomWorld) {
  this.lastResponse = await this.bookingClient!.getBooking(this.bookingId!);
});

When('I get the booking with id {int}', async function (
  this: ICustomWorld,
  id: number,
) {
  this.lastResponse = await this.bookingClient!.getBooking(id);
});

When('I update the booking with the following details:', async function (
  this: ICustomWorld,
  table: DataTable,
) {
  const row     = table.hashes()[0];
  const booking: Booking = {
    firstname:       row.firstname,
    lastname:        row.lastname,
    totalprice:      parseInt(row.totalprice),
    depositpaid:     row.depositpaid === 'true',
    bookingdates:    BookingDatesFactory.upcoming(),
    additionalneeds: row.additionalneeds,
  };
  this.lastResponse = await this.bookingClient!.updateBooking(this.bookingId!, booking);
});

When('I partially update the booking firstname to {string}', async function (
  this: ICustomWorld,
  firstname: string,
) {
  this.lastResponse = await this.bookingClient!.partialUpdateBooking(
    this.bookingId!,
    { firstname },
  );
});

When('I delete the booking', async function (this: ICustomWorld) {
  this.lastResponse = await this.bookingClient!.deleteBooking(this.bookingId!);
});

When('I create a booking with missing firstname', async function (this: ICustomWorld) {
  this.lastResponse = await this.bookingClient!.createBookingMissingField();
});

// ── Then ─────────────────────────────────────────────────────

Then('the response status should be {int}', async function (
  this: ICustomWorld,
  expectedStatus: number,
) {
  log.debug({ expected: expectedStatus, actual: this.lastResponse!.status() }, 'Asserting status');
  expect(this.lastResponse!.status()).toBe(expectedStatus);
});

Then('the response should contain a list of bookings', async function (this: ICustomWorld) {
  const body = await this.lastResponse!.json() as { bookingid: number }[];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  expect(body[0]).toHaveProperty('bookingid');
});

Then('the response should contain the booking id', async function (this: ICustomWorld) {
  const body = await this.lastResponse!.json();
  expect(body).toHaveProperty('bookingid');
  expect(typeof body.bookingid).toBe('number');
});

Then('the booking firstname should be {string}', async function (
  this: ICustomWorld,
  expected: string,
) {
  const body = await this.lastResponse!.json();
  const firstname = body.firstname ?? body.booking?.firstname;
  expect(firstname).toBe(expected);
});

Then('the booking lastname should be {string}', async function (
  this: ICustomWorld,
  expected: string,
) {
  const body = await this.lastResponse!.json();
  const lastname = body.lastname ?? body.booking?.lastname;
  expect(lastname).toBe(expected);
});

Then('the booking totalprice should be {int}', async function (
  this: ICustomWorld,
  expected: number,
) {
  const body = await this.lastResponse!.json();
  const totalprice = body.totalprice ?? body.booking?.totalprice;
  expect(totalprice).toBe(expected);
});

Then('the booking no longer exists', async function (this: ICustomWorld) {
  const response = await this.bookingClient!.getBooking(this.bookingId!);
  expect(response.status()).toBe(404);
  log.info({ bookingId: this.bookingId }, 'Confirmed booking deleted');
});
