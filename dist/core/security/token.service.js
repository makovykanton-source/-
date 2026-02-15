import crypto from "node:crypto";
export class TokenService {
    hashRefreshToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
    randomState() {
        return crypto.randomBytes(32).toString("hex");
    }
}
