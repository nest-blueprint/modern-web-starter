import { Context } from '../context/context';
import { binding, then, when, given } from 'cucumber-tsflow';
import { expect } from 'chai';
import { Type as CustomerType } from '../../src/domain/customer/type';
import request from 'supertest';
import { routesV1 } from '../../config/routes-v1';
import { SharedContext } from '../context/type/shared-context.type';
import { Type as UserType } from '../../src/domain/user/type';
import { User } from '../../src/domain/user';
import { Id as CustomerId } from '../../src/domain/customer/id';
import { Customer } from '../../src/domain/customer';
import { Email } from '../../src/domain/user/email';
import { Auth0UserId } from '../../src/infrastructure/resource/auth0/type/auth0-user-id';
import { randomBetween } from '../../test/double/provider/external/auth0/util/auth0.util';
import { Id as UserId } from '../../src/domain/user/id';
import { InMemoryUserResource } from '../../test/double/provider/external/auth0/authorization/resource/in-memory-user-resource';
import { UserRole as Auth0UserRole } from '../../src/infrastructure/resource/auth0/roles';

@binding([Context])
export class CustomerStep {
  private sharedContext: SharedContext;

  constructor(protected context: Context) {
    this.sharedContext = Context.sharedContext;
  }

  @given(/^a user with email "([^"]*)", with an auth0 account created,a future customer$/)
  createOrAccessWithAuth0UserAccountFutureCustomer(email: string) {
    const auth0UserId = new Auth0UserId(`auth0|${randomBetween(10000000, 99999999)}`);
    const emailObject = Email.fromString(email);
    const userId = UserId.create();
    const userType = UserType.fromString(UserType.Customer);
    const user = User.create(userId, emailObject, userType);

    // Add user to auth0 stub (fake auth0 service). It is now possible to log in with this user
    this.sharedContext.services.auth0.addUser(auth0UserId, user);

    // Also, we need add user in the Auth0Management stub service (UserResource), because it is used to match the user with the application account and check roles

    const userResource = Context.sharedContext.resources.userResource as InMemoryUserResource;
    userResource.users.set(auth0UserId.value, { user, role: Auth0UserRole.customer });
    return { user, auth0UserId };
  }

  @given(/^a successfully registered user with email "([^"]*)", with a "([^"]*)" customer profile created$/)
  setupACustomerUserWithProfileReady(email: string, customerType: string) {
    const wrappedUser = this.createOrAccessWithAuth0UserAccountFutureCustomer(email);
    this.createApplicationAccount(email, UserType.Customer);
    this.createCustomerProfile(wrappedUser.user, CustomerType.fromString(customerType));
  }

  @given(/^a user with email "([^"]*)", who has a registered account as customer$/)
  createApplicationAccount(email: string, role: string) {
    const emailObject = Email.fromString(email);
    const userFromAuth0 = Context.sharedContext.services.auth0.getUserByEmail(emailObject);

    const roleObject = UserType.fromString(role);

    const newUser = User.create(userFromAuth0.user.id, emailObject, roleObject);
    const result = this.sharedContext.repositories.user.add(newUser, userFromAuth0.auth0UserId);

    if (result.isErr()) {
      throw result.error;
    }
  }

  createCustomerProfile(user: User, role: CustomerType) {
    const customerId = CustomerId.create();

    const customer = new Customer(customerId, user, role, '', []);
    const result = this.sharedContext.repositories.customer.add(customer);
    if (result.isErr()) {
      throw result.error;
    }
  }

  @when(/^I create a customer profile with role "([^"]*)"$/)
  async createCustomerProfileWithRole(role: string) {
    const roleObject = CustomerType.fromString(role);
    this.sharedContext.requestBody.createCustomerProfile = {
      type: roleObject.value,
    };

    if (this.sharedContext.user.userAccessToken) {
      this.sharedContext.requestResponse.createCustomerProfile = await request(Context.app.getHttpServer())
        .post(routesV1.customer.register)
        .set('Authorization', `Bearer ${this.sharedContext.user.userAccessToken}`)
        .send(this.sharedContext.requestBody.createCustomerProfile);

      return;
    }

    this.sharedContext.requestResponse.createCustomerProfile = await request(Context.app.getHttpServer())
      .post(routesV1.customer.register)
      .send(this.sharedContext.requestBody.createCustomerProfile);
  }

  @then(/^the customer profile is created successfully$/)
  customerProfileIsCreatedSuccessfully() {
    expect(this.sharedContext.requestResponse.createCustomerProfile.status).to.be.equal(201);
  }

  @then(/^the customer profile is not created, the user is not logged in$/)
  async customerProfileIsNotCreatedTheUserIsNotLoggedIn() {
    expect(this.sharedContext.requestResponse.createCustomerProfile.status).to.be.equal(401);
  }

  @then(/^the customer profile is not created, the user already has a customer profile$/)
  async customerProfileIsNotCreatedTheUserAlreadyHasACustomerProfile() {
    expect(this.sharedContext.requestResponse.createCustomerProfile.status).to.be.equal(409);
  }

  @then(/^the customer profile is not created, the user is registered as a mentor$/)
  async customerProfileIsNotCreatedTheUserIsRegisteredAsAMentor() {
    expect(this.sharedContext.requestResponse.createCustomerProfile.status).to.be.equal(400);
  }

  @then(/^the customer profile is not created, the user already has a mentor profile$/)
  async customerProfileIsNotCreatedTheUserAlreadyHasAMentorProfile() {
    expect(this.sharedContext.requestResponse.createCustomerProfile.status).to.be.equal(409);
  }
}
