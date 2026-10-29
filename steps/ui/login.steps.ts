// steps/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../../support/world';

// ── Given ────────────────────────────────────────────────────

Given('I am on the SauceDemo login page', async function (this: ICustomWorld) {
    if (!this.page) throw new Error('Page is not initialised — check Before hook');
    await this.loginPage!.goto();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/');
});

// ── When ─────────────────────────────────────────────────────

When(
    'I enter username {string} and password {string}',
    async function (this: ICustomWorld, username: string, password: string) {
        await this.loginPage!.fillUsername(username);
        await this.loginPage!.fillPassword(password);
    }
);

When('I click the login button', async function (this: ICustomWorld) {
    await this.loginPage!.clickLogin();
});

When('I click the error dismiss button', async function (this: ICustomWorld) {
    await this.loginPage!.dismissError();
});

When('I open the burger menu', async function (this: ICustomWorld) {
    await this.loginPage!.openBurgerMenu();
});

When('I click logout', async function (this: ICustomWorld) {
    await this.loginPage!.clickLogout();
});

// ── Then ─────────────────────────────────────────────────────

Then('I should be redirected to the inventory page', async function (this: ICustomWorld) {
    await this.loginPage!.expectRedirectedToInventory();
});

Then('I should be redirected to the login page', async function (this: ICustomWorld) {
    await this.loginPage!.expectRedirectedToLogin();
});

Then('the page title should be {string}', async function (this: ICustomWorld, title: string) {
    await this.loginPage!.expectPageTitle(title);
});

Then(
    'I should see the error message {string}',
    async function (this: ICustomWorld, message: string) {
        await this.loginPage!.expectErrorMessage(message);
    }
);

Then('the error message should not be visible', async function (this: ICustomWorld) {
    await this.loginPage!.expectErrorNotVisible();
});