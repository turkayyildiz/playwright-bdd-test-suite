// hooks/hooks.ts
import {Before, After, BeforeAll, AfterAll, setDefaultTimeout} from '@cucumber/cucumber';
import { chromium, Browser, ConsoleMessage } from 'playwright';
import { ICustomWorld } from '../support/world';
import { LoginPage } from '../pages/loginPage';
import { getLogger } from '../utils/logger';
import envConfig from '../config/env.config';

const log = getLogger('Hooks');
let browser: Browser;

// ── Global lifecycle ─────────────────────────────────────────

setDefaultTimeout(envConfig.timeouts.default);

BeforeAll(async () => {
    log.info({ env: process.env.TEST_ENV ?? 'staging' }, 'Launching browser');
    browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo:   process.env.HEADLESS === 'false' ? 800 : 0,
    });
});

AfterAll(async () => {
    log.info('Closing browser');
    await browser.close();
});

// ── Per-scenario lifecycle ────────────────────────────────────

Before({ tags: 'not @api' }, async function (this: ICustomWorld) {
    this.consoleErrors = [];

    this.context = await browser.newContext({
        baseURL:     envConfig.baseUrl,
        viewport:    { width: 1280, height: 720 },
        recordVideo: process.env.CI ? { dir: 'reports/videos' } : undefined,
    });

    this.page = await this.context.newPage();

    // Capture browser console errors for observability
    this.page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
            const entry = `[CONSOLE ERROR] ${msg.text()}`;
            this.consoleErrors!.push(entry);
            log.warn({ msg: msg.text() }, 'Browser console error captured');
        }
    });

    // Start trace for full observability on failure
    await this.context.tracing.start({
        screenshots: true,
        snapshots:   true,
        sources:     true,
    });

    this.loginPage = new LoginPage(this.page);
    log.info('Scenario setup complete');
});

After({ tags: 'not @api' }, async function (this: ICustomWorld, scenario) {
    const failed = scenario.result?.status === 'FAILED';

    if (failed) {
        log.error({ scenario: scenario.pickle.name }, 'Scenario FAILED');

        // Attach screenshot
        const shot = await this.page?.screenshot({ fullPage: true });
        if (shot) {
            this.attach(shot, 'image/png');
            log.debug('Failure screenshot attached to report');
        }

        // Save Playwright trace zip
        await this.context?.tracing.stop({ path: `reports/traces/${scenario.pickle.name}.zip` });
        log.debug('Trace saved');

        // Attach console errors to report
        if (this.consoleErrors && this.consoleErrors.length > 0) {
            this.attach(this.consoleErrors.join('\n'), 'text/plain');
            log.warn({ count: this.consoleErrors.length }, 'Console errors attached');
        }
    } else {
        await this.context?.tracing.stop();
        log.info({ scenario: scenario.pickle.name }, 'Scenario PASSED');
    }

    await this.page?.close();
    await this.context?.close();
});