import { AxiosResponse } from "axios";
import { CategorizedError } from "../../../../utils/errorHandling/internals/categorizedError";
import { ErrorCategories } from "../../../../utils/types/errorHandling/error-categories.enum";
import ApiTestExpectation from "./apiTestExpectation";
import HttpResponseProcessor from "./httpResponseProcessor";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";
import logger from "../../../../utils/logger/loggerManager";

export default class PositiveValidatorUtil {
  /**
   * Validates API responses for positive test flows with comprehensive error handling.
   */
  public static validateResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
    allowEmptyResponse: boolean = false,
  ): void {
    try {
      const validatedResponse = HttpResponseProcessor.assertResponseNotNull(response, context);
      this.validateStatusCode(validatedResponse.status, expectedStatusCode, context);
      HttpResponseProcessor.validateResponseData(validatedResponse, context, allowEmptyResponse);
      HttpResponseProcessor.validateHttpStatus(validatedResponse);
    } catch (error) {
      if (this.isExpectedNegativeTestFailure(error, context)) {
        return;
      }

      ErrorHandler.captureError(
        error,
        "validatePositiveTestResponse",
        "Failed to validate API response",
      );
      throw error;
    }
  }

  /**
   * Simplified status code validation for positive tests
   */
  private static validateStatusCode(actual: number, expected: number, context: string): void {
    const expectation = ApiTestExpectation.getExpectation(context);
    const registeredExpectedCodes = expectation?.expectedStatusCodes ?? [];

    if (registeredExpectedCodes.length > 0) {
      this.validateAgainstRegisteredExpectations(
        actual,
        expected,
        context,
        registeredExpectedCodes,
      );
      return;
    }

    this.validateAgainstPassedParameter(actual, expected, context);
  }

  /**
   * Validates status code against registered expectations
   */
  private static validateAgainstRegisteredExpectations(
    actual: number,
    expected: number,
    context: string,
    registeredExpectedCodes: number[],
  ): void {
    if (registeredExpectedCodes.includes(actual)) {
      logger.info(
        `Status validation PASSED [${context}]: ${actual} matches registered expectation [${registeredExpectedCodes.join(", ")}]`,
      );
      return;
    }

    const errorMessage = `Status validation FAILED [${context}] - Registered expectation: [${registeredExpectedCodes.join(" or ")}], Actual: ${actual}`;
    logger.error(errorMessage, {
      context,
      registeredExpectedCodes,
      actualStatusCode: actual,
      passedExpectedCode: expected,
      isNegativeTest: ApiTestExpectation.isNegativeTest(context),
      validationSource: "registered_expectations",
    });

    throw new CategorizedError(
      ErrorCategories.API_AND_NETWORK,
      {
        context,
        registeredExpectedCodes,
        actualStatusCode: actual,
        passedExpectedCode: expected,
      },
      errorMessage,
    );
  }

  /**
   * Validates status code against passed parameter (fallback)
   */
  private static validateAgainstPassedParameter(
    actual: number,
    expected: number,
    context: string,
  ): void {
    logger.warn(
      `No registered expectations found for [${context}], falling back to passed parameter: ${expected}`,
    );

    if (actual === expected) {
      logger.info(`Status validation PASSED [${context}]: ${actual} (fallback validation)`);
      return;
    }

    this.throwStatusCodeMismatchError(actual, expected, context);
  }

  /**
   * Check if an error is an expected failure in a negative test
   */
  private static isExpectedNegativeTestFailure(error: unknown, context: string): boolean {
    if (error instanceof CategorizedError && error.category === ErrorCategories.EXPECTED_FAILURE) {
      logger.info(`Expected failure in negative test [${context}]: ${error.message}`);
      return true;
    }
    return false;
  }

  /**
   * Throws an error for status code mismatch
   */
  private static throwStatusCodeMismatchError(
    actual: number,
    expected: number,
    context: string,
  ): void {
    const errorMessage = `Status code mismatch [${context}] - Expected: ${expected}, Received: ${actual}.`;
    logger.error(errorMessage);
    throw new CategorizedError(ErrorCategories.API_AND_NETWORK, { context }, errorMessage);
  }
}
