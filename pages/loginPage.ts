// pages/loginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { getLogger } from '../utils/logger';
import envConfig from '../config/env.config';

const log = getLogger('LoginPage');

// ── Strict interfaces — no `any` ────────────────────────────

export interface LoginCredentials {
    username: string;
    password: string;
}

// ── Page Object ──────────────────────────────────────────────

export class LoginPage {
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton:   Locator;
    private readonly errorMessage:  Locator;
    private readonly errorDismiss:  Locator;
    private readonly burgerMenu:    Locator;
    private readonly logoutLink:    Locator;
    private readonly appLogo:       Locator;

    constructor(private readonly page: Page) {
        this.usernameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton   = page.locator('#login-button');
        this.errorMessage  = page.locator('[data-test="error"]');
        this.errorDismiss  = page.locator('.error-button');
        this.burgerMenu    = page.locator('#react-burger-menu-btn');
        this.logoutLink    = page.locator('#logout_sidebar_link');
        this.appLogo       = page.locator('.app_logo');
    }

    // ── Navigation ───────────────────────────────────────────

    async goto(): Promise<void> {
        log.info('Navigating to login page');
        await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: envConfig.timeouts.navigation });
        await expect(this.loginButton).toBeVisible({ timeout: envConfig.timeouts.assertion });
        log.debug('Login page loaded');
    }

    // ── Actions ──────────────────────────────────────────────

    async fillUsername(username: string): Promise<void> {
        log.debug({ username }, 'Filling username');
        await this.usernameInput.clear();
        await this.usernameInput.fill(username);
    }

    async fillPassword(password: string): Promise<void> {
        log.debug('Filling password');
        await this.passwordInput.clear();
        await this.passwordInput.fill(password);
    }

    async clickLogin(): Promise<void> {
        log.info('Clicking login button');
        await this.loginButton.click();
    }

    async enterCredentials(credentials: LoginCredentials): Promise<void> {
        await this.fillUsername(credentials.username);
        await this.fillPassword(credentials.password);
    }

    async dismissError(): Promise<void> {
        log.debug('Dismissing error message');
        await this.errorDismiss.click();
    }

    async openBurgerMenu(): Promise<void> {
        log.debug('Opening burger menu');
        await this.burgerMenu.click();
        await this.logoutLink.waitFor({ state: 'visible', timeout: envConfig.timeouts.assertion });
    }

    async clickLogout(): Promise<void> {
        log.info('Logging out');
        await this.logoutLink.click();
    }

    // ── Assertions ───────────────────────────────────────────

    async expectRedirectedToInventory(): Promise<void> {
        log.debug('Asserting redirect to inventory');
        await expect(this.page).toHaveURL(/inventory\.html/, { timeout: envConfig.timeouts.assertion });
        await expect(this.appLogo).toBeVisible();
    }

    async expectRedirectedToLogin(): Promise<void> {
        log.debug('Asserting redirect to login page');
        await expect(this.page).toHaveURL('/', { timeout: envConfig.timeouts.assertion });
        await expect(this.loginButton).toBeVisible();
    }

    async expectPageTitle(title: string): Promise<void> {
        await expect(this.page).toHaveTitle(title, { timeout: envConfig.timeouts.assertion });
    }

    async expectErrorMessage(partial: string): Promise<void> {
        log.debug({ partial }, 'Asserting error message');
        await expect(this.errorMessage).toBeVisible({ timeout: envConfig.timeouts.assertion });
        await expect(this.errorMessage).toContainText(partial);
    }

    async expectErrorNotVisible(): Promise<void> {
        await expect(this.errorMessage).not.toBeVisible({ timeout: envConfig.timeouts.assertion });
    }
}
