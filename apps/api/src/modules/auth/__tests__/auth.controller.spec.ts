import { AuthController } from '../auth.controller';

describe('AuthController login', () => {
  const authService = {
    login: jest.fn(),
  };
  const usersService = {};
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
});
