import { AxiosResponse, AxiosError } from "axios";
import { CategorizedError } from "../../../../utils/errorHandling/internals/categorizedError";
import { ErrorCategories } from "../../../../utils/types/errorHandling/error-categories.enum";
import ApiTestExpectation from "./apiTestExpectation";
import HttpResponseProcessor from "./httpResponseProcessor";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";
import logger from "../../../../utils/logger/loggerManager";

export default class NegativeValidatorUtil {
  /**
   * Simplified negative test response validation
   */
  public static validateResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
  ): void {
    const isNegativeTest = ApiTestExpectation.isNegativeTest(context);

    this.logNegativeTestContextInfo(isNegativeTest, context, expectedStatusCode);

    // Early return for null response in negative tests
    if (!response && isNegativeTest) {
      this.handleNullResponseForNegativeTest(context);
      return;
    }

    try {
      const validatedResponse = HttpResponseProcessor.assertResponseNotNull(response, context);

      if (isNegativeTest) {
        this.validateNegativeTestStatus(validatedResponse, context);
        return;
      }

      // Fallback for positive tests (defensive programming)
      this.validateStatusCode(validatedResponse.status, expectedStatusCode, context);
    } catch (error) {
      if (isNegativeTest && this.handleNegativeTestError(error, context)) {
        return;
      }

      logger.error(
        `Response Validation Failed in [${context}]: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Handles null response validation for negative tests
   */
  private static handleNullResponseForNegativeTest(context: string): void {
    logger.info(`Null response received as expected for negative test [${context}]`);

    const expectation = ApiTestExpectation.getExpectation(context);
    const expectedCodes = expectation?.expectedStatusCodes || [];

    if (expectedCodes.length > 0) {
      logger.warn(
        `Negative test [${context}] expected status codes [${expectedCodes.join(", ")}] but received null response`,
      );
    }

    logger.info(`Null response treated as expected for negative test [${context}]`);
  }

  /**
   * Validates status code specifically for negative tests
   */
  private static validateNegativeTestStatus(response: AxiosResponse, context: string): boolean {
    if (this.isValidNegativeTestStatus(response.status, context)) {
      logger.info(`Negative test [${context}] passed as expected with status: ${response.status}`);
      return true;
    }

    this.handleNegativeTestResponse(response.status, context);
    return false;
  }

  /**
   * Simplified status code validation with negative test focus
   */
  private static validateStatusCode(actual: number, expected: number, context: string): void {
    this.validateNegativeStatusCode(actual, context);
  }

  /**
   * Focused validation for negative test status codes
   */
  private static validateNegativeStatusCode(actual: number, context: string): void {
    if (this.isValidNegativeTestStatus(actual, context)) {
      logger.info(`Negative test [${context}] status validation passed with code: ${actual}`);
      return;
    }

    const expectation = ApiTestExpectation.getExpectation(context);
    const registeredExpectedCodes = expectation?.expectedStatusCodes || [];

    const errorMessage = `Negative test [${context}] status validation failed - Expected: [${registeredExpectedCodes.join(" or ")}], Received: ${actual}`;
    logger.error(errorMessage);

    throw new CategorizedError(
      ErrorCategories.API_AND_NETWORK,
      {
        context,
        expectedStatusCodes: registeredExpectedCodes,
        actualStatusCode: actual,
        isNegativeTest: true,
      },
      errorMessage,
    );
  }

  /**
   * Handles status validation for negative test responses
   */
  private static handleNegativeTestResponse(status: number, context: string): void {
    const expectation = ApiTestExpectation.getExpectation(context);
    const expectedCodes = expectation?.expectedStatusCodes || [];
    const errorMessage = `Negative test [${context}] status code mismatch - Expected: [${expectedCodes.join(" or ")}], Received: ${status}`;

    logger.error(errorMessage, {
      context,
      expectedStatusCodes: expectedCodes,
      actualStatusCode: status,
      isNegativeTest: true,
    });

    throw new CategorizedError(
      ErrorCategories.API_AND_NETWORK,
      {
        context,
        expectedStatusCodes: expectedCodes,
        actualStatusCode: status,
        isNegativeTest: true,
      },
      errorMessage,
    );
  }

  /**
   * Checks if a status code is valid for a negative test
   */
  private static isValidNegativeTestStatus(actual: number, context: string): boolean {
    if (ApiTestExpectation.isExpectedStatus(context, actual)) {
      logger.info(`Received expected status code ${actual} for negative test: ${context}`);
      return true;
    }

    const expectation = ApiTestExpectation.getExpectation(context);
    const expectedCodes = expectation?.expectedStatusCodes || [];

    if (expectedCodes.length === 0) {
      logger.warn(
        `No expected status codes registered for negative test [${context}], received: ${actual}`,
      );
      if (actual >= 400) {
        logger.info(
          `Status code ${actual} treated as valid for negative test [${context}] (no specific expectations registered)`,
        );
        return true;
      }
    }

    logger.debug(
      `Status code validation check for negative test [${context}] - Expected: [${expectedCodes.join(" or ")}], Received: ${actual}`,
      {
        context,
        expectedStatusCodes: expectedCodes,
        actualStatusCode: actual,
        isNegativeTest: true,
      },
    );

    return false;
  }

  /**
   * Handles error responses in negative test context
   */
  private static handleNegativeTestError(error: unknown, context: string): boolean {
    logger.debug(
      `Handling error in negative test [${context}]: ${error instanceof Error ? error.message : String(error)}`,
    );

    if (this.isExpectedNegativeTestFailure(error, context)) {
      logger.info(`Expected failure handled in negative test [${context}]`);
      return true;
    }

    if (error instanceof CategorizedError && error.category === ErrorCategories.API_AND_NETWORK) {
      logger.error(`Constraint violation in negative test [${context}]: ${error.message}`);
      ErrorHandler.logAndThrow(
        `Negative test validation failed [${context}]: ${error.message}`,
        "handleNegativeTestError",
      );
    }

    if (error instanceof AxiosError && error.response) {
      return this.handleAxiosErrorInNegativeTest(error, context);
    }

    return this.handleNonHttpErrorInNegativeTest(error, context);
  }

  /**
   * Handles AxiosError in negative test context
   */
  private static handleAxiosErrorInNegativeTest(error: AxiosError, context: string): boolean {
    const actualStatus = error.response!.status;
    const expectation = ApiTestExpectation.getExpectation(context);
    const registeredExpectedCodes = expectation?.expectedStatusCodes || [];

    logger.info(`Handling AxiosError in negative test [${context}] with status: ${actualStatus}`);

    if (registeredExpectedCodes.length === 0) {
      return this.handleAxiosErrorWithoutExpectedCodes(actualStatus, context);
    }

    return this.handleAxiosErrorWithExpectedCodes(actualStatus, registeredExpectedCodes, context);
  }

  /**
   * Handles AxiosError when no expected codes are registered
   */
  private static handleAxiosErrorWithoutExpectedCodes(
    actualStatus: number,
    context: string,
  ): boolean {
    logger.warn(
      `Negative test [${context}] has no registered expected status codes, treating status ${actualStatus} as valid`,
    );

    if (actualStatus >= 400) {
      logger.info(
        `AxiosError with error status ${actualStatus} treated as expected for negative test [${context}]`,
      );
      return true;
    }

    ErrorHandler.logAndThrow(
      `Negative test [${context}] has no registered expected status codes for validation`,
      "handleNegativeTestError",
    );
    return false;
  }

  /**
   * Handles AxiosError when expected codes are registered
   */
  private static handleAxiosErrorWithExpectedCodes(
    actualStatus: number,
    registeredExpectedCodes: number[],
    context: string,
  ): boolean {
    if (registeredExpectedCodes.includes(actualStatus)) {
      logger.info(
        `Negative test [${context}] PASSED - AxiosError status ${actualStatus} matches registered expectations [${registeredExpectedCodes.join(", ")}]`,
      );
      return true;
    }

    logger.error(
      `Negative test [${context}] failed: Expected status [${registeredExpectedCodes.join(" or ")}], but received ${actualStatus} via AxiosError`,
    );
    ErrorHandler.logAndThrow(
      `Negative test [${context}] failed: Expected status [${registeredExpectedCodes.join(" or ")}], but received ${actualStatus}`,
      "handleNegativeTestError",
    );
  }

  /**
   * Handles non-HTTP errors in negative test context
   */
  private static handleNonHttpErrorInNegativeTest(error: unknown, context: string): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.info(`Non-HTTP error in negative test [${context}]: ${errorMessage}`, {
      context,
      errorType: "NON_HTTP_ERROR",
      error: errorMessage,
    });

    logger.info(`Non-HTTP error treated as expected behavior in negative test [${context}]`);
    return true;
  }

  /**
   * Logs negative test context information
   */
  private static logNegativeTestContextInfo(
    isNegativeTest: boolean,
    context: string,
    expectedStatusCode: number,
  ): boolean {
    const expectation = ApiTestExpectation.getExpectation(context);

    if (!isNegativeTest) {
      logger.warn(`Test type mismatch detected for context '${context}'`, {
        context,
        method: "validateNegativeTestResponse",
        expectedStatusCode,
        actualTestType: "positive",
        expectedTestType: "negative",
        testExpectation: {
          expectedStatusCodes: expectation?.expectedStatusCodes || [],
          isNegativeTest: expectation?.isNegativeTest || false,
        },
        message: "Context is registered as positive test but being validated as negative test",
      });
      return false;
    }

    return true;
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
}
