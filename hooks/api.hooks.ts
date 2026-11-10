// hooks/api.hooks.ts
import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import { ICustomWorld } from '../support/world';
import { BookingClient } from '../api/bookingClient';
import { getLogger } from '../utils/logger';
import envConfig from '../config/env.config';

const log = getLogger('ApiHooks');

setDefaultTimeout(envConfig.timeouts.default);

Before({ tags: '@api' }, async function (this: ICustomWorld) {
  log.info('Setting up API request context');
  this.apiRequest    = await request.newContext();
  this.bookingClient = new BookingClient(this.apiRequest);
  log.info('API context ready');
});

After({ tags: '@api' }, async function (this: ICustomWorld) {
  const status = this.lastResponse?.status();
  const isExpectedError = status === 404 || status === 500;

  if (this.lastResponse && !this.lastResponse.ok() && !isExpectedError) {
    const body = await this.lastResponse.text().catch(() => 'unreadable');
    log.error({ status, body }, 'Unexpected API response');
    this.attach(`Status: ${status}\nBody: ${body}`, 'text/plain');
  }
  await this.apiRequest?.dispose();
  log.info('API context disposed');
});
