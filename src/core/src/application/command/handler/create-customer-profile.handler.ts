import { CreateCustomerProfileCommand } from '../create-customer-profile-command';
import { CommandHandler } from '@nestjs/cqrs';
import { CustomerCollectionToken, UserCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { Inject } from '@nestjs/common';
import { CustomerCollection } from '../../../domain/collection/customer.collection';
import { Id as CustomerId } from '../../../domain/customer/id';
import { Id as UserId } from '../../../domain/user/id';
import { Customer } from '../../../domain/customer';
import { Type as CustomerType } from '../../../domain/customer/type';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { CustomerAlreadyExistsException } from '../../../infrastructure/exception/customer-already-exists.exception';
import { UserCollection } from '../../../domain/collection/user.collection';
import { UserNotFoundException } from '../../../infrastructure/exception/user-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@CommandHandler(CreateCustomerProfileCommand)
export class CreateCustomerProfileHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(CustomerCollectionToken) private readonly customers: CustomerCollection,
    @Inject(UserCollectionToken) private readonly users: UserCollection,
  ) {}

  async execute(command: CreateCustomerProfileCommand): Promise<void> {
    this.logger.debug('CreateCustomerProfileHandler.execute', { command });
    const { customerId, userId, customerRole } = this.getValueObjectsFromCommand(command);

    if (await this.customerAlreadyExists(customerId)) {
      throw new CustomerAlreadyExistsException(`customer profile with id ${customerId.value} already exists.`);
    }

    const userFoundResult = await this.users.get(userId);
    if (userFoundResult.isErr()) {
      throw new UserNotFoundException(`cannot create customer profile.User with id ${userId.value} not found.`);
    }

    const userFound = userFoundResult.value;

    const customer = new Customer(customerId, userFound, customerRole, '', []);

    const customerResult = await this.customers.add(customer);

    if (customerResult.isErr()) {
      throw customerResult.error;
    }

    this.logger.debug('CreateCustomerProfileHandler.execute : success.', { customer });
  }

  private getValueObjectsFromCommand(command: CreateCustomerProfileCommand) {
    try {
      return {
        customerId: new CustomerId(command.customerId),
        userId: new UserId(command.userId),
        customerRole: new CustomerType(command.type),
      };
    } catch (error: any) {
      throw new InvalidArgumentCommandException(error.message, error);
    }
  }

  private async customerAlreadyExists(customerId: CustomerId): Promise<boolean> {
    const customerResult = await this.customers.get(customerId);
    return customerResult.isOk();
  }
}
