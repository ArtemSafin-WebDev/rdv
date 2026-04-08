import { RentCalculator } from "./rentCalculator.js";
import { RentCalculatorHttpApi } from "./rentCalculatorHttpApi.js";
import { RentCalculatorMockApi } from "./rentCalculatorApi.js";

function resolveCalculatorApi(root) {
  const apiUrl = root.dataset.rentCalculatorApiUrl?.trim();

  if (!apiUrl) {
    window.console.error(
      "[rent-calculator] Missing data-rent-calculator-api-url",
      root
    );

    return null;
  }

  if (apiUrl === "mock") {
    return new RentCalculatorMockApi();
  }

  return new RentCalculatorHttpApi(apiUrl);
}

document.querySelectorAll("[data-rent-calculator]").forEach((root) => {
  const api = resolveCalculatorApi(root);

  if (!api) {
    return;
  }

  const calculator = new RentCalculator(root, api);
  calculator.init();
});
