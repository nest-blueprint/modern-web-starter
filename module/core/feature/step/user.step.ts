import {  binding, given } from 'cucumber-tsflow';
import { expect } from 'chai';
import { Context } from '../context/context';
import { Email } from '../../src/domain/user/email';


import { SharedContext } from '../context/type/shared-context.type';

@binding([Context])
export class UserStep {
  private sharedContext: SharedContext;

  constructor(protected context: Context) {
    this.sharedContext = Context.sharedContext;
  }

  @given(/^the user with email "([^"]*)" is logged in$/)
  authenticateUser(email: string) {
    const emailObject = Email.fromString(email);
    const userFromAuth0 = this.sharedContext.services.auth0.getUserByEmail(emailObject);
    this.sharedContext.user.auth0UserId = userFromAuth0.auth0UserId;
    this.sharedContext.user.userAccessToken = this.sharedContext.services.auth0.logIn(userFromAuth0.auth0UserId);
    expect(this.sharedContext.user.userAccessToken).to.not.be.an('undefined');
  }
}
