import * as bcrypt from "bcrypt";

export async function hashPassword(pass: string) {
  return await bcrypt.hash(pass, 12);
}

export function hashPasswordSync(pass: string) {
  return bcrypt.hashSync(pass, 12);
}
