import { AuthedUser } from './jwt-auth.guard';
export declare function assertSelfOrAdmin(user: AuthedUser, consumerId: string): void;
