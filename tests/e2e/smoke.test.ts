import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the application is reachable and renders.
 * These will be expanded with real user-journey tests as features are built.
 */
test.describe("Landing page", () => {
  test("loads successfully and shows the GCC heading", async ({ page }) => {
    await page.goto("/");

    // Page should return 200
    await expect(page).toHaveTitle(/GCC/);

    // The main heading should be visible
    await expect(
      page.getByRole("heading", { name: /Global Collaboration Cell/i }),
    ).toBeVisible();
  });

  test("shows the Coming Soon badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Coming Soon/i)).toBeVisible();
  });

  test("returns 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
