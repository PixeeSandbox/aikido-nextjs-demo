import { expect, test } from '@playwright/test'

test.describe('checkout', () => {
  test('an empty basket sends you back to tickets', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByRole('heading', { name: /basket is empty/i })).toBeVisible()
    await page.getByRole('link', { name: /Browse admission types/i }).click()
    await expect(page).toHaveURL(/\/tickets$/)
  })

  test('checkout form validates required fields before submitting', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByRole('button', { name: /Pay securely/i }).click()
    await expect(page.getByText(/name is a required field/i)).toBeVisible()
  })

  test('checkout form rejects a malformed email', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByLabel('Full name').fill('Ada Okonkwo')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Email').blur()
    await expect(page.getByText(/must be a valid email/i)).toBeVisible()
  })

  test('confirmation page handles an unknown order reference', async ({ page }) => {
    await page.goto('/checkout/confirmation?orderId=does-not-exist')
    await expect(page.getByRole('heading', { name: /couldn.t find that booking/i })).toBeVisible()
  })
})
