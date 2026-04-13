import { UserModel, UserDocument } from '../models';
import { hashPassword, comparePassword, generateApiKey } from '../utils';
import { generateJwt } from '../auth/jwtAuth';
import mongoose from 'mongoose';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ token: string; userId: string }> {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const apiKey = generateApiKey();

    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      apiKey,
      type: 'human',
    });

    const token = generateJwt({ userId: user._id.toString(), type: user.type });

    return { token, userId: user._id.toString() };
  }

  async login(input: LoginInput): Promise<{ token: string; userId: string }> {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(input.password, user.passwordHash!);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateJwt({ userId: user._id.toString(), type: user.type });

    return { token, userId: user._id.toString() };
  }

  async loginWithApiKey(apiKey: string): Promise<{ token: string; userId: string }> {
    const user = await UserModel.findOne({ apiKey });
    if (!user) {
      throw new Error('Invalid API key');
    }

    const token = generateJwt({ userId: user._id.toString(), type: user.type });

    return { token, userId: user._id.toString() };
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }
    return UserModel.findById(userId);
  }

  async refreshSession(userId: string): Promise<{ token: string }> {
    if (!isValidObjectId(userId)) {
      throw new Error('User not found');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const token = generateJwt({ userId: user._id.toString(), type: user.type });
    return { token };
  }

  async regenerateApiKey(userId: string): Promise<{ apiKey: string }> {
    if (!isValidObjectId(userId)) {
      throw new Error('User not found');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newApiKey = generateApiKey();
    user.apiKey = newApiKey;
    await user.save();

    return { apiKey: newApiKey };
  }
}

export const authService = new AuthService();
