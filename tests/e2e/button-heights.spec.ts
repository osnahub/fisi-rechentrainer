import { test, expect } from "@playwright/test";

const viewports = [
  { name: "small-320", width: 320, height: 568 },
  { name: "android-360", width: 360, height: 740 },
  { name: "iphone-375", width: 375, height: 667 },
  { name: "iphone14-390", width: 390, height: 844 },
];

for (const vp of viewports) {
  test(`Button rows have uniform heights in viewport ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.waitForTimeout(300);

    const modules = ["dec2bin", "bin2dec", "hex", "subnet", "explainer"];

    for (const mod of modules) {
      await page.click(`#tab-${mod}`);
      await page.waitForTimeout(150);

      const buttonData = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.map((b) => {
          const rect = b.getBoundingClientRect();
          return {
            text: b.innerText.replace(/\n/g, " ").trim(),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            height: Math.round(rect.height * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
          };
        }).filter((b) => b.height > 0);
      });

      // Check all buttons placed in the same visual horizontal row (top within 8px)
      const processed = new Set<string>();
      for (const b of buttonData) {
        if (processed.has(b.text)) continue;
        const row = buttonData.filter((other) => Math.abs(other.top - b.top) <= 8);
        if (row.length > 1) {
          row.forEach((r) => processed.add(r.text));
          const heights = row.map((r) => r.height);
          const minH = Math.min(...heights);
          const maxH = Math.max(...heights);
          expect(
            maxH - minH,
            `Height mismatch in ${mod} row at top ${b.top}: ${row.map((r) => `${r.text} (${r.height}px)`).join(", ")}`
          ).toBeLessThanOrEqual(0.5);
        }
      }
    }
  });
}
