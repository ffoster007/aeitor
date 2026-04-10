import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";

export async function issueTokens(user: { id: string; email: string; username: string }) {
  const jti = randomUUID();

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, username: user.username }),
    signRefreshToken({ sub: user.id, jti }),
  ]);

  // Store only a hash of the refresh token so DB leaks cannot be replayed.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
    },
  });

  await setAuthCookies(accessToken, refreshToken);
}
