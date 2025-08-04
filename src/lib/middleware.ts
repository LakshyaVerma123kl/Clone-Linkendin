// src/lib/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import rateLimit from "@/lib/rate-limit";

// Rate limiting configurations
const rateLimitConfigs = {
  auth: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  posts: { requests: 10, window: 60 * 1000 }, // 10 requests per minute
  comments: { requests: 20, window: 60 * 1000 }, // 20 requests per minute
  general: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
};

// Validation schemas
export const validationSchemas = {
  user: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
    },
    email: {
      required: true,
      pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128,
    },
    bio: {
      required: false,
      maxLength: 500,
    },
  },
  post: {
    content: {
      required: true,
      minLength: 1,
      maxLength: 1000,
      sanitize: true,
    },
  },
  comment: {
    content: {
      required: true,
      minLength: 1,
      maxLength: 500,
      sanitize: true,
    },
  },
};

// Enhanced error response format
export interface APIError {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface APISuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Generate unique request ID for tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Standardized error response
export function createErrorResponse(
  error: string,
  code: string,
  status: number = 500,
  details?: any,
  requestId?: string
): NextResponse {
  const response: APIError = {
    success: false,
    error,
    code,
    details: process.env.NODE_ENV === "development" ? details : undefined,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status });
}

// Standardized success response
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  requestId?: string
): NextResponse {
  const response: APISuccess<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status });
}

// Input validation middleware
export function validateInput(
  data: any,
  schema: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldRules = rules as any;

    // Required validation
    if (
      fieldRules.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip other validations if field is not required and empty
    if (
      !fieldRules.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      continue;
    }

    // Length validations
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors.push(
        `${field} must be at least ${fieldRules.minLength} characters long`
      );
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors.push(`${field} cannot exceed ${fieldRules.maxLength} characters`);
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }

    // Sanitization
    if (fieldRules.sanitize && typeof value === "string") {
      // Basic XSS prevention
      data[field] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>?/gm, "")
        .trim();
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Database middleware
export async function withDatabase<T>(handler: () => Promise<T>): Promise<T> {
  try {
    await connectToDatabase();
    return await handler();
  } catch (error: any) {
    console.error("Database operation failed:", error);
    throw new Error("Database connection failed");
  }
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const userId = await getCurrentUser(request);

    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        "UNAUTHORIZED",
        401,
        null,
        requestId
      );
    }

    return await handler(userId);
  } catch (error: any) {
    console.error("Authentication error:", error);
    return createErrorResponse(
      "Authentication failed",
      "AUTH_ERROR",
      401,
      error.message,
      requestId
    );
  }
}

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimitConfigs,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = generateRequestId();
  const config = rateLimitConfigs[type];

  try {
    const identifier =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitResult = await rateLimit(
      identifier,
      config.requests,
      config.window
    );

    if (!rateLimitResult.success) {
      return createErrorResponse(
        "Rate limit exceeded",
        "RATE_LIMIT_EXCEEDED",
        429,
        {
          limit: config.requests,
          window: config.window,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        requestId
      );
    }

    const response = await handler();

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", config.requests.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      rateLimitResult.resetTime.toString()
    );

    return response;
  } catch (error: any) {
    console.error("Rate limiting error:", error);
    return createErrorResponse(
      "Rate limiting failed",
      "RATE_LIMIT_ERROR",
      500,
      error.message,
      requestId
    );
  }
}

// Enhanced error handling wrapper
export function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // Log request
      console.log(`[${requestId}] ${request.method} ${request.url} - Started`);

      const response = await handler(request, ...args);

      // Log successful response
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] ${request.method} ${request.url} - Completed in ${duration}ms`
      );

      return response;
    } catch (error: any) {
      // Log error
      const duration = Date.now() - startTime;
      console.error(
        `[${requestId}] ${request.method} ${request.url} - Error in ${duration}ms:`,
        error
      );

      // Handle different error types
      if (error.name === "ValidationError") {
        return createErrorResponse(
          "Validation failed",
          "VALIDATION_ERROR",
          400,
          error.errors,
          requestId
        );
      }

      if (error.name === "CastError") {
        return createErrorResponse(
          "Invalid ID format",
          "INVALID_ID",
          400,
          null,
          requestId
        );
      }

      if (error.code === 11000) {
        return createErrorResponse(
          "Duplicate entry",
          "DUPLICATE_ERROR",
          409,
          null,
          requestId
        );
      }

      // Generic server error
      return createErrorResponse(
        "Internal server error",
        "INTERNAL_ERROR",
        500,
        error.message,
        requestId
      );
    }
  };
}

// Content sanitization
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim();
}

// Combined middleware for API routes
export function createAPIHandler(config: {
  requireAuth?: boolean;
  rateLimit?: keyof typeof rateLimitConfigs;
  validation?: any;
}) {
  return function (
    handler: (
      request: NextRequest,
      context: { userId?: string; validatedData?: any }
    ) => Promise<NextResponse>
  ) {
    return withErrorHandling(async (request: NextRequest, ...args: any[]) => {
      const requestId = generateRequestId();
      let context: { userId?: string; validatedData?: any } = {};

      // Rate limiting
      if (config.rateLimit) {
        const rateLimitResponse = await withRateLimit(
          request,
          config.rateLimit,
          async () => NextResponse.json({ success: true })
        );

        if (!rateLimitResponse.ok) {
          return rateLimitResponse;
        }
      }

      // Authentication
      if (config.requireAuth) {
        const userId = await getCurrentUser(request);
        if (!userId) {
          return createErrorResponse(
            "Authentication required",
            "UNAUTHORIZED",
            401,
            null,
            requestId
          );
        }
        context.userId = userId;
      }

      // Input validation
      if (
        config.validation &&
        (request.method === "POST" || request.method === "PUT")
      ) {
        try {
          const data = await request.json();
          const validation = validateInput(data, config.validation);

          if (!validation.isValid) {
            return createErrorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              400,
              { errors: validation.errors },
              requestId
            );
          }

          context.validatedData = data;
        } catch (error) {
          return createErrorResponse(
            "Invalid JSON",
            "INVALID_JSON",
            400,
            null,
            requestId
          );
        }
      }

      // Database connection
      await connectToDatabase();

      return await handler(request, context);
    });
  };
}
