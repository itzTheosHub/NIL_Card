import { test, expect } from "@playwright/test"

test.describe("Login page back button", () => {
  test("back button on login page navigates user to the previous page", async ({ page }) => {
    // Start at the home page
    await page.goto("http://localhost:3000/")
    await page.waitForLoadState("networkidle")

    // Navigate to login page
    // Open the menu drawer and click Sign In, or navigate directly
    await page.goto("http://localhost:3000/login")
    await page.waitForLoadState("networkidle")

    // Verify we're on the login page
    await expect(page.locator("h1")).toContainText("Welcome back")

    // Look for a back button on the login page - this is the expected UX element
    // The bug is that there is no back button, so this should fail when the bug is present
    const backButton = page.locator(
      'button:has-text("Back"), a:has-text("Back"), [aria-label="Back"], [aria-label="Go back"], button:has-text("back"), a:has-text("back")'
    )

    // The back button should exist on the login page
    await expect(backButton.first()).toBeVisible({ timeout: 5000 })

    // Click the back button
    await backButton.first().click()

    // After clicking back, we should no longer be on the login page
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 })
  })

  test("navigating from homepage to login and using back button returns to homepage", async ({ page }) => {
    // Establish history: homepage → login
    await page.goto("http://localhost:3000/")
    await page.waitForLoadState("networkidle")
    await page.goto("http://localhost:3000/login")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("h1")).toContainText("Welcome back")

    // Look for a back button element on the login page
    const backButton = page.locator(
      'button:has-text("Back"), a:has-text("Back"), [aria-label="Back"], [aria-label="Go back"], button:has-text("back"), a:has-text("back")'
    )

    // The back button should be visible and functional
    await expect(backButton.first()).toBeVisible({ timeout: 5000 })

    // Click back button
    await backButton.first().click()

    // Should navigate back to homepage
    await expect(page).toHaveURL("http://localhost:3000/", { timeout: 5000 })
  })
})
