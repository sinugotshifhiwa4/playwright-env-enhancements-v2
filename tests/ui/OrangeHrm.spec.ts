import { test, expect } from "@playwright/test";
import EnvironmentVariables from "../../src/configuration/environment/variables/environmentVariables";
import logger from "../../src/utils/logger/loggerManager";

test.only("OrangeHrm", async ({ page }) => {
  await page.goto(EnvironmentVariables.PORTAL_BASE_URL);

                    expect(page).toHaveTitle("OrangeHRM");
                   expect(page).toHaveURL(EnvironmentVariables.PORTAL_BASE_URL);

  logger.info(`Navigated to ${page.url()}`);
  await page.waitForTimeout(5000);
});