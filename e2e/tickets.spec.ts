import { expect, test } from '@playwright/test'

test.describe('admissions browsing', () => {
  test('home page links through to the tickets index', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Book admission' }).click()
    await expect(page.getByRole('heading', { name: /Admission & tickets/i })).toBeVisible()
  })

  test('tickets index separates timed entry from anytime admission', async ({ page }) => {
    await page.goto('/tickets')
    await expect(page.getByRole('heading', { name: 'Timed entry' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Any time during opening hours/i })
    ).toBeVisible()
  })

  test('a timed-entry ticket type offers a date picker', async ({ page }) => {
    await page.goto('/tickets')
    await page.locator('section', { hasText: 'Timed entry' }).getByRole('link').first().click()
    await expect(page.getByLabel('Visit date')).toBeVisible()
  })

  test('unknown ticket slug renders the not-found page', async ({ page }) => {
    const response = await page.goto('/tickets/no-such-ticket')
    expect(response?.status()).toBe(404)
    await expect(page.getByText(/drifted out of orbit/i)).toBeVisible()
  })
})
