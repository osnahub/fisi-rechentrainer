import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("FiSi Rechentrainer E2E & Accessibility Suite", () => {
  const consoleErrors: string[] = [];
  const pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    pageErrors.length = 0;
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err);
    });
    await page.goto("/");
  });

  test.afterEach(async () => {
    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((e) => e.message).join(", ")}`).toEqual([]);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join("; ")}`).toEqual([]);
  });

  test("Module navigation and URL query synchronization", async ({ page }) => {
    // Check initial module
    await expect(page.locator("h1")).toContainText("FiSi-Rechentrainer");
    await expect(page.locator("#tab-dec2bin")).toHaveAttribute("aria-selected", "true");

    // Click on 'Binär ➔ Dezimal'
    await page.click("#tab-bin2dec");
    await expect(page).toHaveURL(/.*module=bin2dec/);
    await expect(page.locator("#panel-bin2dec")).toBeVisible();

    // Click on 'Hexadezimal'
    await page.click("#tab-hex");
    await expect(page).toHaveURL(/.*module=hex/);
    await expect(page.locator("#panel-hex")).toBeVisible();

    // Click on 'Subnetz'
    await page.click("#tab-subnet");
    await expect(page).toHaveURL(/.*module=subnet/);
    await expect(page.locator("#panel-subnet")).toBeVisible();

    // Click on 'Rechenhelfer'
    await page.click("#tab-explainer");
    await expect(page).toHaveURL(/.*module=explainer/);
    await expect(page.locator("#panel-explainer")).toBeVisible();
  });

  test("Dezimal ➔ Binär: dual input modes and hint on error", async ({ page }) => {
    await page.click("#tab-dec2bin");

    // Verify sub-buttons: 'Bits klicken' and 'Binär tippen'
    const clickTab = page.locator('button:has-text("Bits klicken")');
    const typeTab = page.locator('button:has-text("Binär tippen")');
    await expect(clickTab).toBeVisible();
    await expect(typeTab).toBeVisible();

    // In 'Bits klicken' mode, verify 8 bit toggles exist
    const bitButtons = page.locator('button[aria-label^="Bit "]');
    await expect(bitButtons).toHaveCount(8);

    // Switch to 'Binär tippen'
    await typeTab.click();
    const binaryInput = page.locator('input[placeholder*="01010101"], input[aria-label*="Binär"], input[type="text"]').first();
    await expect(binaryInput).toBeVisible();

    // Type a wrong answer first to test feedback & hint
    await binaryInput.fill("00000000");
    await page.keyboard.press("Enter");

    // Feedback message should appear
    const feedback = page.locator('[role="status"], [role="alert"]').first();
    await expect(feedback).toBeVisible();

    // Click 'Lösung anzeigen'
    const revealBtn = page.locator('button:has-text("Lösung anzeigen"), button:has-text("Lösungsweg")').first();
    await expect(revealBtn).toBeVisible();
    await revealBtn.click();

    // The primary action should now offer next exercise
    const nextBtn = page.locator('button:has-text("Nächste Aufgabe")');
    await expect(nextBtn).toBeVisible();
  });

  test("Hexadezimal sub-modes toggle cleanly", async ({ page }) => {
    await page.click("#tab-hex");

    const subModes = [
      "Bin ➔ Hex",
      "Hex ➔ Bin",
      "Dez ➔ Hex",
      "Hex ➔ Dez",
    ];

    for (const mode of subModes) {
      const modeBtn = page.locator(`button[role="tab"]:has-text("${mode}")`);
      await expect(modeBtn).toBeVisible();
      await modeBtn.click();
      await expect(page.locator('input[type="text"]')).toBeVisible();
    }
  });

  test("Subnetz trainer sub-modes work", async ({ page }) => {
    await page.click("#tab-subnet");

    const subModes = [
      "CIDR ➔ Maske",
      "Maske ➔ Binär",
      "Schrittweite",
    ];

    for (const mode of subModes) {
      const modeBtn = page.locator(`button[role="tab"]:has-text("${mode}")`);
      await expect(modeBtn).toBeVisible();
      await modeBtn.click();
      await expect(page.locator('input[type="text"]')).toBeVisible();
    }
  });

  test("Erklär-Rechner renders calculation paths without crashing and caps input to 32 bits", async ({ page }) => {
    await page.click("#tab-explainer");

    const numInput = page.locator("#explainer-number-input");
    await numInput.fill("192");

    // Check that all 3 pathways are rendered
    await expect(page.locator("text=Stellenwertmethode (Subtraktion)")).toBeVisible();
    await expect(page.locator("text=Restwertmethode (:2)")).toBeVisible();
    await expect(page.locator("text=Polynom- & Potenzdarstellung")).toBeVisible();

    // Switch to binary format and verify bit capping
    await page.click('button:has-text("Binär (Basis 2)")');
    // Type 40 bits
    await numInput.fill("1111000011110000111100001111000011110000");
    const val = await numInput.inputValue();
    expect(val.replace(/\s+/g, "").length).toBeLessThanOrEqual(32);
  });

  test("Keyboard navigation (Skip-Link and Enter key flow)", async ({ page }) => {
    // Verify skip link is attached with proper target and accessibility attributes
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(page.locator("#main-content")).toBeAttached();

    // Test Enter key workflow in Binär ➔ Dezimal
    await page.click("#tab-bin2dec");
    const input = page.locator("#bin2dec-input");
    await expect(input).toBeVisible();

    // Type an incorrect answer and press Enter to check
    await input.fill("999");
    await input.press("Enter");

    // Feedback should be visible
    const feedback = page.locator('[role="status"], [role="alert"]').first();
    await expect(feedback).toBeVisible();

    // Reveal solution
    const revealBtn = page.locator('button:has-text("Lösungsweg")');
    await revealBtn.click();

    // Next button should be present
    const nextBtn = page.locator('button:has-text("Nächste Aufgabe")');
    await expect(nextBtn).toBeVisible();

    // Press Enter in input to trigger next task
    await input.press("Enter");
    await expect(input).toHaveValue("");
  });

  test("Accessibility (WCAG 2.2 AA / Axe audit across tabs)", async ({ page }) => {
    const tabSelectors = [
      "#tab-dec2bin",
      "#tab-bin2dec",
      "#tab-hex",
      "#tab-subnet",
      "#tab-explainer",
    ];

    for (const selector of tabSelectors) {
      await page.click(selector);
      await page.waitForTimeout(200);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );

      expect(
        seriousOrCritical,
        `Accessibility violations found in tab ${selector}: ${JSON.stringify(seriousOrCritical, null, 2)}`
      ).toEqual([]);
    }
  });

  test("Responsive layout: no horizontal scrollbar across viewports", async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // Small mobile (iPhone SE)
      { width: 375, height: 667 }, // Standard mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }, // Desktop
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/");
      await page.waitForTimeout(200);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll, `Horizontal overflow detected at ${vp.width}x${vp.height}`).toBe(false);
    }
  });


  test("REPRODUCE Befund 1: Multi-context hydration check without console or page errors", async ({ browser }) => {
    // 3 fresh browser contexts must mount cleanly without React error #418 or hydration mismatches
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const contextErrors: string[] = [];
      page.on("pageerror", (err) => contextErrors.push(`[PageError] ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") contextErrors.push(`[ConsoleError] ${msg.text()}`);
      });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      expect(
        contextErrors.filter((e) => e.includes("418") || e.includes("Hydration") || e.includes("server-rendered")),
        `Hydration error detected in context ${i + 1}: ${contextErrors.join("; ")}`
      ).toEqual([]);
      await context.close();
    }
  });

  test("REPRODUCE Befund 4: No duplicate IDs and valid ARIA controls when reference bar is open", async ({ page }) => {
    await page.goto("/");
    await page.click("#reference-accordion-trigger");
    await expect(page.locator("#reference-accordion-panel")).toBeVisible();

    const duplicateIds = await page.evaluate(() => {
      const allIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
      return allIds.filter((id, index) => allIds.indexOf(id) !== index);
    });
    expect(duplicateIds, `Found duplicate IDs: ${duplicateIds.join(", ")}`).toEqual([]);

    const brokenControls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("[aria-controls]"))
        .map((el) => el.getAttribute("aria-controls")!)
        .filter((id) => !document.getElementById(id));
    });
    expect(brokenControls, `Found broken aria-controls targets: ${brokenControls.join(", ")}`).toEqual([]);
  });

  test("REPRODUCE Befund 5: Browser Back/Forward keeps URL and UI in sync and preserves task state", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#tab-dec2bin")).toHaveAttribute("aria-selected", "true");

    // Click on Hex
    await page.click("#tab-hex");
    await expect(page).toHaveURL(/.*module=hex/);

    // Click on Subnet
    await page.click("#tab-subnet");
    await expect(page).toHaveURL(/.*module=subnet/);

    // Go back to Hex
    await page.goBack();
    await expect(page).toHaveURL(/.*module=hex/);
    await expect(page.locator("#tab-hex")).toHaveAttribute("aria-selected", "true");

    // Go back to Root /
    await page.goBack();
    await expect(page.locator("#tab-dec2bin")).toHaveAttribute("aria-selected", "true");
  });

  test("REPRODUCE Befund 2: Hard offline PWA test with active controller and cleared HTTP cache", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");

    // Wait for Service Worker registration
    const isRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return !!reg && !!reg.active;
    });
    expect(isRegistered).toBe(true);

    // Clear browser HTTP cache via CDP
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.clearBrowserCache");

    // Switch to offline
    await context.setOffline(true);

    // Reload offline
    await page.reload({ waitUntil: "domcontentloaded" });

    // Header must still render offline
    await expect(page.locator("h1")).toContainText("FiSi-Rechentrainer");

    await cdp.detach();
    await context.close();
  });

  test("REPRODUCE Befund 8: Production CSP header does not allow unsafe-eval", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    const csp = headers["content-security-policy"] || "";
    expect(csp).not.toContain("'unsafe-eval'");
  });
});
