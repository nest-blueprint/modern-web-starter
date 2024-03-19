import { CommandInterface } from '../interface/command.interface';

export class RegisterUserCommand implements CommandInterface {
  constructor(
    private readonly _user_id: string,
    private readonly _email: string,
    private readonly _role: string,
    private readonly _auth0UserId: string,
  ) {
    Object.freeze(this);
  }

  get userId(): string {
    return this._user_id;
  }

  get email(): string {
    return this._email;
  }

  get role(): string {
    return this._role;
  }

  get auth0UserId(): string {
    return this._auth0UserId;
  }
}
