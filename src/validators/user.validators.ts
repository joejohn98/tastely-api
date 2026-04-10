import z from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").optional(),
    lastName: z.string().trim().min(1, "Last name is required").optional(),
    email: z.email("Invalid email address").trim().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters")
      .optional(), // Removed role as it's explicitly disallowed by superRefine
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined ||
      data.password !== undefined,
    {
      message:
        "At least one field (firstName, lastName, email, or password) must be provided for update",
    },
  ) // Added superRefine to explicitly disallow the role field from being updated
  .superRefine((data, ctx) => {
    if ("role" in data) {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "You are not allowed to update the role field",
      });
    }
  });

export type updateProfileInput = z.infer<typeof updateProfileSchema>;
