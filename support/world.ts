// support/world.ts
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { BrowserContext, Page } from 'playwright';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { BookingClient } from '../api/bookingClient';

export interface ICustomWorld extends World {
    // UI
    context:       BrowserContext    | undefined;
    page:          Page              | undefined;
    loginPage:     LoginPage         | undefined;
    consoleErrors: string[];
    // API
    apiRequest:    APIRequestContext | undefined;
    bookingClient: BookingClient     | undefined;
    bookingId:     number            | undefined;
    lastResponse:  APIResponse       | undefined;
}

export class CustomWorld extends World implements ICustomWorld {
    // UI
    context:       BrowserContext    | undefined = undefined;
    page:          Page              | undefined = undefined;
    loginPage:     LoginPage         | undefined = undefined;
    consoleErrors: string[]                      = [];
    // API
    apiRequest:    APIRequestContext | undefined = undefined;
    bookingClient: BookingClient     | undefined = undefined;
    bookingId:     number            | undefined = undefined;
    lastResponse:  APIResponse       | undefined = undefined;
}

setWorldConstructor(CustomWorld);