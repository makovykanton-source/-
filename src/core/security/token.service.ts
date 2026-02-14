import crypto from "node:crypto";

export class TokenService {
  hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  randomState(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
