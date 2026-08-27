import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  const authService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    socialLogin: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
  };
  const amplitude = {
    track: jest.fn(),
    identifyUser: jest.fn(),
  };
  const controller = new AuthController(
    authService as any,
    usersService as any,
    amplitude as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('delegates valid credentials and returns fresh auth tokens', async () => {
    const result = {
      user: { id: 'user-1', role: 'PLATFORM_ADMIN' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.login.mockResolvedValue(result);

    await expect(
      controller.login({ email: 'admin@example.com', password: 'secure-password' }),
    ).resolves.toEqual(result);

    expect(authService.login).toHaveBeenCalledWith('admin@example.com', 'secure-password');
    expect(amplitude.track).toHaveBeenCalledWith('user-1', 'User Signed In', {
      auth_method: 'email',
      role: 'PLATFORM_ADMIN',
    });
  });

  it('returns a sanitized authenticated profile for session restoration', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'member@example.com',
      role: 'CONSUMER',
      passwordHash: 'must-not-leak',
    });

    await expect(controller.profile({ user: { sub: 'user-1' } } as any)).resolves.toEqual({
      id: 'user-1',
      email: 'member@example.com',
      role: 'CONSUMER',
    });
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });

  it('delegates token refresh without requiring an access token', async () => {
    const tokens = { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' };
    authService.refreshTokens.mockResolvedValue(tokens);

    await expect(controller.refresh({ refreshToken: 'stale-access-token' })).resolves.toEqual(tokens);
    expect(authService.refreshTokens).toHaveBeenCalledWith('stale-access-token');
  });

  it('supports the unified mobile social sign-in route', async () => {
    const result = { user: { id: 'user-2', role: 'CONSUMER' } };
    authService.socialLogin.mockResolvedValue(result);

    await expect(
      controller.social({ provider: 'google', email: 'member@example.com', name: 'Member' }),
    ).resolves.toEqual(result);

    expect(authService.socialLogin).toHaveBeenCalledWith(
      'google',
      'member@example.com',
      'Member',
      undefined,
    );
    expect(amplitude.track).toHaveBeenCalledWith('user-2', 'User Signed In', {
      auth_method: 'google',
      role: 'CONSUMER',
    });
  });
});
