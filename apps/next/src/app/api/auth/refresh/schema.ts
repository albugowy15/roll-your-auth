import { z } from "zod";

export const refreshTokenApiSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
}).required();

export type ApiRefreshTokenResponse = {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
};

export type RefreshTokenResponse = {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
};
