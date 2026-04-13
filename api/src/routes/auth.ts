import { Router, Request, Response } from 'express';
import { authService } from '../services';
import { verifyJwt } from '../auth/jwtAuth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.register({ email, password });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: message });
  }
});

router.post('/cli-login', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const result = await authService.loginWithApiKey(apiKey);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CLI login failed';
    res.status(401).json({ error: message });
  }
});

router.post('/session', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const payload = verifyJwt(token);
    const result = await authService.refreshSession(payload.userId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Session refresh failed';
    res.status(401).json({ error: message });
  }
});

router.delete('/session', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const payload = verifyJwt(token);
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userId: user._id, email: user.email, type: user.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    res.status(401).json({ error: message });
  }
});

export default router;
