import { UserModel } from '../models';

export interface Context {
  user?: {
    userId: string;
    type: string;
  };
}

export async function buildContext(
  headers: Record<string, string | undefined>
): Promise<Context> {
  const authHeader = headers.authorization;

  if (!authHeader) {
    return {};
  }

  if (authHeader.startsWith('Bearer ')) {
    const jwt = await import('./jwtAuth');
    try {
      const payload = jwt.verifyJwt(authHeader.slice(7));
      return { user: { userId: payload.userId, type: payload.type } };
    } catch {
      return {};
    }
  }

  if (authHeader.startsWith('ak_')) {
    const apiKeyAuth = await import('./apiKeyAuth');
    try {
      const payload = await apiKeyAuth.apiKeyAuth(authHeader);
      return { user: payload };
    } catch {
      return {};
    }
  }

  return {};
}
