import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = './presentation_assets';

const TARGETS = [
    { name: '01_ai_concierge_dashboard', url: '/en/?q=Renewable+energy+projects+in+East+Kalimantan', wait: 5000 },
    { name: '02_ai_compare_synthesis', url: '/en/compare', wait: 8000 },
    { name: '03_ai_regional_intelligence', url: '/en/regions?id=5', wait: 6000 },
    { name: '04_ai_multilingual_power_zh', url: '/zh/project/928', wait: 6000 },
    { name: '05_ai_multilingual_power_en', url: '/en/project/928', wait: 6000 },
    { name: '06_onboarding_clean_step1', url: '/en/onboarding' },
    { 
        name: '07_onboarding_scale_logic', 
        url: '/en/onboarding', 
        action: async (page) => {
            await page.click('button:has-text("Manufacturing"), button:has-text("Manufaktur")');
            await page.waitForTimeout(1000);
            await page.click('button:has-text("Continue"), button:has-text("Lanjutkan")');
            await page.waitForTimeout(2000);
        }
    },
    { 
        name: '08_interactive_infra_map', 
        url: '/en/regions', 
        wait: 10000,
        action: async (page) => {
            await page.waitForTimeout(5000);
            const toggles = await page.$$('button');
            for (const btn of toggles) {
                const text = await btn.innerText();
                if (['Ports', 'Airports', 'Energy', 'Industrial', 'Seaports'].some(t => text.includes(t))) {
                    await btn.click();
                    await page.waitForTimeout(300);
                }
            }
            await page.waitForTimeout(3000);
        }
    },
    { name: '09_submit_project_portal', url: '/en/submit' },
    { name: '10_login_entrance', url: '/en/login', noAuth: true }
];

if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
    console.log('🚀 Final definitive capture: Presentation Mode + Data Layer Toggles...');
    const browser = await chromium.launch({ headless: true });

    for (const target of TARGETS) {
        const context = await browser.newContext({
            viewport: { width: 1440, height: 900 },
            deviceScaleFactor: 2,
        });

        await context.addInitScript(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                aside { display: none !important; }
                header { left: 0 !important; width: 100% !important; }
                main { margin-left: 0 !important; padding-left: 0 !important; }
                button[aria-label="Toggle sidebar"] { display: none !important; }
            `;
            document.head.appendChild(style);
        });

        if (!target.noAuth) {
            await context.addCookies([{ name: 'proto_auth', value: 'true', domain: 'localhost', path: '/' }]);
        }

        const page = await context.newPage();
        const fullUrl = `${BASE_URL}${target.url}`;
        console.log(`   📸 [${target.name}]`);
        
        try {
            await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
            if (target.action) await target.action(page);
            await page.waitForTimeout(target.wait || 3500);
            await page.screenshot({ path: path.join(OUTPUT_DIR, `${target.name}.png`) });
            console.log(`      ✅ Saved.`);
        } catch (err) {
            console.error(`      ❌ Failed: ${err.message}`);
        }
        await context.close();
    }

    await browser.close();
    console.log(`\n✨ Final Presentation Assets Ready.`);
})();
