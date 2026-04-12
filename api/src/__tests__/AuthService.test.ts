import { authService } from '../services/AuthService';
import { UserModel } from '../models/User';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('userId');
      expect(result.token).toBeTruthy();
      expect(result.userId).toBeTruthy();

      const user = await UserModel.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
      expect(user?.type).toBe('human');
      expect(user?.apiKey).toMatch(/^ak_/);
    });

    it('should throw error if email already exists', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password456',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('userId');
      expect(result.token).toBeTruthy();
    });

    it('should throw error with wrong password', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user does not exist', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const registerResult = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const user = await authService.getUserById(registerResult.userId);

      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      const user = await authService.getUserById('nonexistent-id');
      expect(user).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session and return new token', async () => {
      const registerResult = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authService.refreshSession(registerResult.userId);

      expect(result).toHaveProperty('token');
      expect(result.token).toBeTruthy();
    });

    it('should throw error if user not found', async () => {
      await expect(
        authService.refreshSession('nonexistent-id')
      ).rejects.toThrow('User not found');
    });
  });
});
