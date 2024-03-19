import { QueryHandler } from '@nestjs/cqrs';
import { GetCustomerProfileByIdQuery } from '../get-customer-profile-by-id.query';
import { QueryHandlerInterface } from '../../interface/query-handler.interface';
import { Customer } from '../../../domain/customer';
import { Id as CustomerId } from '../../../domain/customer/id';
import { CustomerCollectionToken } from '../../../infrastructure/repository/factory/token.factory';
import { Inject } from '@nestjs/common';
import { CustomerCollection } from '../../../domain/collection/customer.collection';
import { InvalidArgumentCommandException } from '../../exception/command/invalid-argument-command.exception';
import { Result } from 'neverthrow';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueryHandler(GetCustomerProfileByIdQuery)
export class GetCustomerProfileByIdHandler implements QueryHandlerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(CustomerCollectionToken) private readonly customers: CustomerCollection,
  ) {}

  async execute(query: GetCustomerProfileByIdQuery): Promise<Customer> {
    this.logger.debug('GetCustomerProfileByIdHandler.execute', { query });
    const customerId = this.getCustomerId(query.customerId);

    const customerResult: Result<Customer, Error> = await this.customers.get(customerId);

    if (customerResult.isErr()) {
      throw customerResult.error;
    }
    this.logger.debug('GetCustomerProfileByIdHandler.execute : success.', { customer: customerResult.value });
    return customerResult.value;
  }

  private getCustomerId(id: string): CustomerId {
    try {
      return new CustomerId(id);
    } catch (error: any) {
      throw new InvalidArgumentCommandException('Invalid customer id');
    }
  }
}
