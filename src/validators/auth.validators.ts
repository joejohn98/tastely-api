import z from "zod";

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Invalid email address").trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),
  role: z.literal("customer").default("customer"), // Restrict registration   role to 'customer'
});

const loginUserSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "admin"]),
});

const createAdminUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),
  role: z.literal("admin"), // Use literal for strict admin role
});

export type RegisterInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export { registerUserSchema, loginUserSchema, updateUserRoleSchema, createAdminUserSchema };