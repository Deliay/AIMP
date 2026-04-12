import { UserModel } from '../models';

export async function apiKeyAuth(apiKey: string): Promise<{ userId: string; type: string }> {
  const user = await UserModel.findOne({ apiKey });
  if (!user) {
    throw new Error('Invalid API key');
  }
  return { userId: user._id.toString(), type: user.type };
}
