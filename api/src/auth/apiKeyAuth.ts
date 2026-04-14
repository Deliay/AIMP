import { UserModel } from '../models';
import { AgentBotModel } from '../models';

export async function apiKeyAuth(apiKey: string): Promise<{ userId: string; type: string }> {
  const user = await UserModel.findOne({ apiKey });
  if (user) {
    return { userId: user._id.toString(), type: user.type };
  }
  const agentBot = await AgentBotModel.findOne({ apiKey });
  if (agentBot) {
    return { userId: agentBot._id.toString(), type: 'agent' };
  }
  throw new Error('Invalid API key');
}
