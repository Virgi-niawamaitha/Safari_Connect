import { ZodError } from "zod";

export const errorHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = Number(error?.statusCode || 400);

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};