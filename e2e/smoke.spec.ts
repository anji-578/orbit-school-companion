import { test, expect } from '@playwright/test'

test.describe('Orbit smoke', () => {
  test('landing renders profile chooser', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/student|orbit/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
