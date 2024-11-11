import { z } from "zod";

export type ApiPostLoginResponse = {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
};

export const loginSchema = z
  .object({
    username: z.string().min(6).max(16),
    password: z.string().min(6).max(16),
  })
  .required();

export interface LoginAPIResponse {
  success: boolean;
  message: string;
  fieldErrors?: {
    username?: string[];
    password?: string[];
  };
}
