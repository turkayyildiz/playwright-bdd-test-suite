// steps/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { ICustomWorld } from '../../support/world';
import { UserFactory } from '../../utils/test-data.factory';

// ── Given ────────────────────────────────────────────────────

Given('I am on the SauceDemo login page', async function (this: ICustomWorld) {
    if (!this.loginPage) throw new Error('LoginPage is not initialised — check Before hook');
    await this.loginPage.goto();
});

// ── When ─────────────────────────────────────────────────────

// User types map to env.config users (standard, problem, locked, invalid, performance)
When('I enter the credentials of the {string} user', async function (this: ICustomWorld, userType: string) {
    await this.loginPage!.enterCredentials(UserFactory.get(userType));
});

When('I enter a password without a username', async function (this: ICustomWorld) {
    await this.loginPage!.enterCredentials(UserFactory.emptyUsername());
});

When('I enter a username without a password', async function (this: ICustomWorld) {
    await this.loginPage!.enterCredentials(UserFactory.emptyPassword());
});

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