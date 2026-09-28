import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { test as base, expect, type Locator, type Page } from '@playwright/test'

const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(`Page: ${error.message}`))
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`Console: ${message.text()}`)
    })
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`)
    })
    await use(errors)
    expect(errors, 'The page should not report script, console, or asset errors').toEqual([])
  }, { auto: true }],
})

const sections = [
  ['Design', 'design'],
  ['Engineering', 'engineering'],
  ['Technology', 'technology'],
  ['Experience', 'experience'],
  ['Configure', 'configure'],
] as const

function control(scope: Page | Locator, name: string) {
  return scope.getByRole('button', { name, exact: true })
    .or(scope.getByRole('tab', { name, exact: true }))
    .or(scope.getByRole('radio', { name, exact: true }))
}

async function choose(page: Page, category: string, value: string) {
  const configuration = page.locator('#configure')
  await control(configuration, category).click()
  await control(configuration, value).click()
}

async function expectSelected(page: Page, category: string, value: string) {
  const configuration = page.locator('#configure')
  await control(configuration, category).click()
  const option = control(configuration, value)
  await expect.poll(async () => option.evaluate(element =>
    element.getAttribute('aria-pressed') === 'true' ||
    element.getAttribute('aria-checked') === 'true' ||
    element.getAttribute('aria-selected') === 'true' ||
    (element instanceof HTMLInputElement && element.checked),
  ), { message: `${value} should remain selected after loading the saved configuration` }).toBe(true)
}

test('the campaign replaces the starter and provides real section navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /engineered to move\.?/i })).toBeVisible({ timeout: 3_000 })
  for (const [label, id] of sections) {
    const link = page.getByRole('link', { name: label, exact: true }).filter({ visible: true }).first()
    await expect(link).toHaveAttribute('href', `#${id}`)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toBeInViewport()
  }
})

test('configuration choices save, appear in the summary, and restore on a later visit', async ({ page }) => {
  await page.goto('/#configure')
  await choose(page, 'Exterior', 'Forest')
  await choose(page, 'Wheels', 'Sport 22')
  await choose(page, 'Interior', 'Limestone')
  await choose(page, 'Accent', 'Copper')
  const save = page.getByRole('button', { name: 'Save configuration', exact: true })
  await save.click()
  const dialog = page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })
  await expect(dialog).toBeVisible()
  for (const finish of ['Forest', 'Sport 22', 'Limestone', 'Copper']) {
    await expect(dialog).toContainText(finish)
  }
  await expect.poll(() => page.evaluate(() => localStorage.getItem('vanta-x1-configuration'))).not.toBeNull()
  for (let index = 0; index < 7; index++) {
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(save).toBeFocused()
  await page.reload()
  for (const [category, value] of [['Exterior', 'Forest'], ['Wheels', 'Sport 22'], ['Interior', 'Limestone'], ['Accent', 'Copper']]) {
    await expectSelected(page, category, value)
  }
})

test('all available finishes are selectable and the summary reflects the final selection', async ({ page }) => {
  await page.goto('/#configure')
  for (const [category, values] of [
    ['Exterior', ['Obsidian', 'Glacier Silver', 'Forest']],
    ['Wheels', ['Aero 21', 'Sport 22']],
    ['Interior', ['Charcoal', 'Limestone']],
    ['Accent', ['Sage', 'Copper']],
  ] as const) {
    for (const value of values) {
      await choose(page, category, value)
      await expectSelected(page, category, value)
    }
  }
  await choose(page, 'Exterior', 'Glacier Silver')
  await choose(page, 'Wheels', 'Aero 21')
  await choose(page, 'Interior', 'Charcoal')
  await choose(page, 'Accent', 'Sage')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })
  for (const finish of ['Glacier Silver', 'Aero 21', 'Charcoal', 'Sage']) {
    await expect(dialog).toContainText(finish)
  }
})

test('malformed saved data cannot prevent configuration', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vanta-x1-configuration', '{invalid json'))
  await page.goto('/#configure')
  await choose(page, 'Exterior', 'Obsidian')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })).toContainText('Obsidian')
})

test('blocked browser storage still allows a configuration summary', async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() { throw new DOMException('Browser storage is unavailable', 'SecurityError') },
      })
    }
  })
  await page.goto('/#configure')
  await choose(page, 'Exterior', 'Forest')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })).toContainText('Forest')
})

test('mobile navigation traps focus, closes with Escape, and follows section links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const open = page.getByRole('button', { name: 'Open menu', exact: true })
  await open.click()
  const menu = page.getByRole('dialog')
  await expect(menu).toBeVisible()
  await expect(menu).toContainText(/VANTA/i)
  await expect(menu.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible()
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press('Tab')
    await expect.poll(() => menu.evaluate(element => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(open).toBeFocused()
  for (const [label, id] of sections) {
    await open.click()
    await menu.getByRole('link', { name: label, exact: true }).click()
    await expect(menu).not.toBeVisible()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toBeInViewport()
  }
})

test('each explorer feature presents its own descriptive content', async ({ page }) => {
  await page.goto('/#experience')
  const experience = page.locator('#experience')
  const descriptions = new Set<string>()
  for (const feature of ['Headlights', 'Aerodynamics', 'Wheels', 'Rear', 'Cabin']) {
    await control(experience.getByRole('group', { name: 'Vehicle details' }), feature).click()
    await expect.poll(async () => {
      const text = (await experience.locator('p').allTextContents()).join(' ').trim()
      return text.length > 30 && !descriptions.has(text)
    }, { message: `${feature} should show a distinct, useful description` }).toBe(true)
    descriptions.add((await experience.locator('p').allTextContents()).join(' ').trim())
  }
  expect(descriptions.size).toBe(5)
})

for (const width of [360, 390, 480, 768, 1024, 1280, 1440]) {
  test(`the ${width}px layout has no horizontal overflow or hidden section content`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /engineered to move\.?/i })).toBeVisible()
    for (const [, id] of sections) {
      const section = page.locator(`#${id}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await expect.poll(() => page.evaluate(() => Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ) - window.innerWidth), { message: `Overflow at ${width}px in ${id}` }).toBeLessThanOrEqual(1)
    }
  })
}

test('reduced motion preserves the story and configuration controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /engineered to move\.?/i })).toBeVisible()
  for (const [, id] of sections) {
    const section = page.locator(`#${id}`)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading').first()).toBeVisible()
    await expect(section).not.toHaveCSS('opacity', '0')
  }
  await choose(page, 'Exterior', 'Forest')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })).toContainText('Forest')
})

test('without WebGL the explorer keeps a loaded image and usable feature controls', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(contextId: string, ...args: unknown[]) {
        if (/webgl/i.test(contextId)) return null
        return Reflect.apply(original, this, [contextId, ...args])
      },
    })
  })
  await page.goto('/#experience')
  const experience = page.locator('#experience')
  await experience.scrollIntoViewIfNeeded()
  const fallback = experience.locator('img[alt]').filter({ visible: true }).first()
  await expect(fallback).toBeVisible()
  await expect.poll(() => fallback.evaluate(element =>
    element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
  )).toBe(true)
  await control(experience.getByRole('group', { name: 'Vehicle details' }), 'Cabin').click()
  await expect(experience).toContainText(/cabin|interior|cockpit/i)
  await choose(page, 'Exterior', 'Glacier Silver')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })).toContainText('Glacier Silver')
})

test('desktop content and the configuration dialog meet automated accessibility checks', async ({ page }) => {
  // Measure settled content, not an intermediate alpha value during a reveal.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /engineered to move\.?/i })).toBeVisible()
  const pageResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(pageResults.violations).toEqual([])
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Your VANTA X1', exact: true })).toBeVisible()
  const dialogResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(dialogResults.violations).toEqual([])
})

test('the mobile navigation meets automated accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations).toEqual([])
})

test('the live showroom renders and changes the vehicle finish', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#experience')
  await expect(page.locator('#experience')).toBeInViewport()
  const scene = page.locator('#experience .vehicle-scene')
  await expect(scene.locator('canvas')).toBeVisible()
  await expect(scene.locator('.vehicle-scene-fallback')).toHaveCount(0)
  const silver = await scene.screenshot()
  await choose(page, 'Exterior', 'Forest')
  await expect(page.locator('.showroom__scene-label')).toContainText('Forest')
  const forest = await scene.screenshot()
  expect(silver.equals(forest)).toBe(false)
  await control(page.getByRole('group', { name: 'Vehicle details', exact: true }), 'Rear').click()
  await expect(scene).toHaveAttribute('aria-label', /rear view/)
})

test('the hero can enter and leave its interactive 3D view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore in 3D', exact: true }).click()
  await expect(page.locator('#models canvas')).toBeVisible()
  await page.getByRole('button', { name: 'Studio view', exact: true }).click()
  await expect(page.locator('#models canvas')).toHaveCount(0)
  await expect(page.locator('#models picture img')).toBeVisible()
})

test('saved configurations download as an honest concept summary', async ({ page }) => {
  await page.goto('/#configure')
  await choose(page, 'Exterior', 'Obsidian')
  await page.getByRole('button', { name: 'Save configuration', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download configuration', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('VANTA-X1-configuration.txt')
  const contents = await readFile((await download.path())!, 'utf8')
  expect(contents).toContain('Obsidian')
  expect(contents).toContain('not an order or reservation')
})

test('design, airflow, cockpit and technology controls change their presentation', async ({ page }) => {
  await page.goto('/')
  await page.locator('#design').getByRole('button', { name: /Light signature/ }).click()
  await expect(page.locator('#design')).toContainText('Recognisable before it arrives.')
  await page.getByRole('button', { name: 'Pause airflow', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Resume airflow', exact: true })).toBeVisible()
  await page.locator('.interior__hotspot').nth(1).click()
  await expect(page.locator('.interior__hotspot').nth(1)).toHaveAttribute('aria-pressed', 'true')
  await page.locator('#technology').getByRole('button', { name: /Intelligent energy/ }).click()
  await expect(page.locator('#technology')).toContainText('The right route. The right charge.')
  await page.locator('#technology').getByRole('button', { name: /Connected experience/ }).click()
  await expect(page.locator('#technology')).toContainText('Familiar from the first drive.')
})

test('performance follows scroll and retains manual controls with reduced motion', async ({ page }) => {
  await page.goto('/')
  const positions = await page.locator('#performance').evaluate(element => ({ top: element.getBoundingClientRect().top + window.scrollY, travel: element.clientHeight - window.innerHeight }))
  await page.evaluate(({ top, travel }) => window.scrollTo({ top: top + travel * .5, behavior: 'instant' }), positions)
  await expect(page.locator('.performance__number')).toContainText('610')
  await page.evaluate(({ top, travel }) => window.scrollTo({ top: top + travel * .95, behavior: 'instant' }), positions)
  await expect(page.locator('.performance__number')).toContainText('520')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.locator('#performance').getByRole('button', { name: '0–100 km/h', exact: true }).click()
  await expect(page.locator('.performance__number')).toContainText('3.2')
})

