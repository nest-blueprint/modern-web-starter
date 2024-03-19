import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../roles';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
