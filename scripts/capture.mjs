import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'artifacts/desktop-hero.png' })
for (const id of ['design', 'engineering', 'interior', 'technology', 'experience']) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded()
  await page.waitForTimeout(id === 'experience' ? 2500 : 1000)
  await page.screenshot({ path: `artifacts/desktop-${id}.png` })
}
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: 'artifacts/desktop-full.png', fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'artifacts/mobile-hero.png' })
await page.locator('#experience').scrollIntoViewIfNeeded()
await page.waitForTimeout(2000)
await page.screenshot({ path: 'artifacts/mobile-showroom.png' })
console.log(JSON.stringify({ errors, title: await page.title() }))
await browser.close()
