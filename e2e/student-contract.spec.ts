import { expect, test } from '@playwright/test'

test.describe('Student contract smoke', () => {
  test('settings landing lists account rows and logout confirmation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dev/student?theme=dark&fixtures=0&dest=settings', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('student-preview')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: 'Personal details' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page.getByRole('dialog', { name: 'Log out?' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog', { name: 'Log out?' })).toHaveCount(0)
  })

  test('learn empty subjects does not invent demo subjects', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dev/student?theme=dark&fixtures=0&dest=learn', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('student-preview')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('No subjects yet')).toBeVisible()
    await expect(page.getByText('Mathematics')).toHaveCount(0)
  })
})
