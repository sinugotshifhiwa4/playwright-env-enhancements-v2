import { AxiosResponse } from "axios";
import ApiTestExpectation from "./internal/apiTestExpectation";
import PositiveValidatorUtil from "./internal/positiveValidatorUtil";
import NegativeValidatorUtil from "./internal/negativeValidatorUtil";
import logger from "../../../utils/logger/loggerManager";

export default class ApiResponseValidator {
  /**
   * General method to validate any response with proper context checking
   * @param response - The API response
   * @param expectedStatusCode - The expected status code
   * @param context - The operation context
   * @param forceTestType - Optional: force a specific test type validation
   * @param allowEmptyResponse - Optional: allow empty response data (default: false)
   */
  public static validateResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
    forceTestType?: "positive" | "negative",
    allowEmptyResponse: boolean = false,
  ): void {
    const isNegativeTest = ApiTestExpectation.isNegativeTest(context);
    const actualTestType = isNegativeTest ? "negative" : "positive";

    this.logTestTypeDiscrepancy(forceTestType, actualTestType, context);

    // Route to appropriate validation method
    if (isNegativeTest) {
      NegativeValidatorUtil.validateResponse(response, expectedStatusCode, context);
    } else {
      PositiveValidatorUtil.validateResponse(
        response,
        expectedStatusCode,
        context,
        allowEmptyResponse,
      );
    }
  }

  /**
   * Logs test type discrepancy information
   */
  private static logTestTypeDiscrepancy(
    forceTestType: "positive" | "negative" | undefined,
    actualTestType: string,
    context: string,
  ): void {
    if (forceTestType && forceTestType !== actualTestType) {
      const expectation = ApiTestExpectation.getExpectation(context);
      logger.info(`Test type information for context '${context}'`, {
        context,
        registeredType: actualTestType,
        forcedType: forceTestType,
        testExpectation: {
          expectedStatusCodes: expectation?.expectedStatusCodes ?? [],
          isNegativeTest: expectation?.isNegativeTest ?? false,
        },
        message: `Context is registered as ${actualTestType} test but validation requested as ${forceTestType}`,
      });
    }
  }
}
