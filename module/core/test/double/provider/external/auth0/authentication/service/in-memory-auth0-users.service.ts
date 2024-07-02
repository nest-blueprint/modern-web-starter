import { User } from '../../../../../../../src/domain/user';
import { Auth0UserId } from '../../../../../../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomString } from '../../util/auth0.util';
import { JwtPayload as Auth0JwtUserPayload } from '../../../../../../../src/infrastructure/authentication/auth0/module/interface/jwt-payload.interface';
import { Email } from '../../../../../../../src/domain/user/email';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../../constant.auth0';

export class InMemoryAuth0Service {
  users: Map<string, Omit<User, 'userType'>> = new Map(); // Map<Auth0UserId,User>
  loggedInMap: Map<string, string> = new Map(); // Map<Auth0UserId,access_token>

  addUser(auth0UserId: Auth0UserId, user: Omit<User, 'userType'>) {
    if (this.users.has(auth0UserId.value)) {
      throw new Error(
        `User ${user.person.firstname} ${user.person.lastname} with auth0Id ${auth0UserId.value} and UserId (${user.id.value}) is already registered.`,
      );
    }
    return this.users.set(auth0UserId.value, user);
  }
  logIn(auth0UserId: Auth0UserId) {
    if (!this.users.has(auth0UserId.value)) {
      throw new Error(
        `User with authOId ${auth0UserId.value} cannot be logged in, the user does not have a registered account.`,
      );
    }

    if (this.loggedInMap.has(auth0UserId.value)) {
      return this.loggedInMap.get(auth0UserId.value);
    }

    const token = sign({ user_id: auth0UserId.value }, JWT_SECRET, { expiresIn: '1h' });
    this.loggedInMap.set(auth0UserId.value, token);
    return token;
  }

  logOut(auth0UserId: Auth0UserId) {
    if (!this.users.has(auth0UserId.value)) {
      throw new Error(
        `User with authOId ${auth0UserId.value} cannot be logged in, the user does not have a registered account.`,
      );
    }
    if (!this.loggedInMap.has(auth0UserId.value)) {
      throw new Error(`User with auth0Id ${auth0UserId.value} cannot be logged out, the user is not logged in`);
    }
    return this.loggedInMap.delete(auth0UserId.value);
  }

  getUser(auth0UserId: Auth0UserId) {
    if (!this.users.has(auth0UserId.value)) {
      throw new Error(`User with auth0Id ${auth0UserId.value} cannot be found, the user does not exist.`);
    }
    return this.users.get(auth0UserId.value);
  }

  getUserByEmail(email: Email) {
    const tupleResult = Array.from(this.users.entries()).find((tuple) => tuple[1].email.value === email.value);
    if (!tupleResult) {
      throw new Error(`User with email ${email.value} cannot be found, the user does not exist.`);
    }
    return { user: tupleResult[1], auth0UserId: new Auth0UserId(tupleResult[0]) };
  }

  isLogged(auth0UserId: Auth0UserId) {
    return this.loggedInMap.has(auth0UserId.value);
  }

  logOutAll() {
    this.loggedInMap.clear();
  }

  removeAllUsers() {
    this.users.clear();
  }

  generateUserLoggedPayload(auth0Id: Auth0UserId): Auth0JwtUserPayload {
    return {
      iss: 'https://dev-1q2w3e4r.eu.auth0.com/',
      sub: auth0Id.value,
      aud: ['https://dev-1q2w3e4r.eu.auth0.com/', 'http://localhost:5000'],
      iat: 1600000000,
      exp: 1600000000,
      azp: randomString(20, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      scope: 'openid profile email',
    };
  }
}
