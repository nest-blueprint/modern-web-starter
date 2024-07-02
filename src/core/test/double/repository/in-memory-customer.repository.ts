import { Inject, Injectable } from '@nestjs/common';
import { CustomerCollection } from '../../../src/domain/collection/customer.collection';
import { Customer } from '../../../src/domain/customer';
import { Id as CustomerId } from '../../../src/domain/customer/id';
import { Id as UserId } from '../../../src/domain/user/id';
import { err, ok, Result } from 'neverthrow';
import { CustomerAlreadyExistsException } from '../../../src/infrastructure/exception/customer-already-exists.exception';
import { CustomerNotFoundException } from '../../../src/infrastructure/exception/customer-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class InMemoryCustomerRepository implements CustomerCollection {
  customers: Map<string, Customer> = new Map<string, Customer>();

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  add(customer: Customer): Result<Customer, Error> {
    this.logger.debug(`InMemoryCustomerRepository.add : execute - ${customer.id.value}`, { customer: customer });
    if (!this.customerCanBeAdded(customer)) {
      this.logger.debug(`InMemoryCustomerRepository.add : failure - already exists`, { customer: customer });
      return err(
        new CustomerAlreadyExistsException('Customer profile already exists', { id: customer.id.value, customer }),
      );
    }
    this.customers.set(customer.id.value, customer);
    this.logger.debug(`InMemoryCustomerRepository.add : success`, { customer: customer });
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    return ok(customer);
  }

  delete(id: CustomerId): Result<Customer, Error> {
    this.logger.debug(`InMemoryCustomerRepository.delete : execute - ${id.value}`, { id: id.value });

    if (!this.customers.has(id.value)) {
      this.logger.debug(`InMemoryCustomerRepository.delete : failure - not found`, { id: id.value });
      return err(new CustomerNotFoundException(`Customer profile not found`, { id: id.value }));
    }
    const customer = this.customers.get(id.value);
    this.customers.delete(id.value);
    this.logger.debug(`InMemoryCustomerRepository.delete : success`, { id: id.value });
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    return ok(customer);
  }

  get(id: CustomerId): Result<Customer, Error> {
    this.logger.debug(`InMemoryCustomerRepository.get : execute`, { id: id.value });
    if (!this.customers.has(id.value)) {
      this.logger.debug(`InMemoryCustomerRepository.get : failure - not found`, { id: id.value });
      return err(new CustomerNotFoundException(`Customer profile not found`, { id: id.value }));
    }
    const customer = this.customers.get(id.value);
    this.logger.debug(`InMemoryCustomerRepository.get : success -  ${id.value}`, { id: id.value });
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    return ok(customer);
  }

  clear(): void {
    this.logger.debug(`InMemoryCustomerRepository.clear : execute`);
    this.customers.clear();
  }

  count(): number {
    this.logger.debug(`InMemoryCustomerRepository.count : execute`);
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    return this.customers.size;
  }

  private customerCanBeAdded(customer: Customer): boolean {
    this.logger.debug(`InMemoryCustomerRepository.customerCanBeAdded : execute - ${customer.id.value}`, {
      customer: customer,
    });
    const customerFound = [...this.customers.values()].find((c) => {
      return c.id.value === customer.id.value || c.user.id.value === customer.user.id.value;
    });
    this.logger.debug(`InMemoryCustomerRepository.customerCanBeAdded : ${!customerFound}`, {
      customerFound: customerFound,
    });
    return !customerFound;
  }

  getByUserId(userId: UserId): Result<Customer, Error> {
    this.logger.debug(`InMemoryCustomerRepository.getByUserId : execute - ${userId.value}`, { userId: userId.value });
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    const customerFound = [...this.customers.values()].find((c) => {
      return c.user.id.value === userId.value;
    });

    if (!customerFound) {
      this.logger.debug(`InMemoryCustomerRepository.getByUserId : failure - not found`, { userId: userId.value });
      return err(new CustomerNotFoundException(`Customer profile not found`, { id: userId.value }));
    }

    this.logger.debug(`InMemoryCustomerRepository.getByUserId : success`, { userId: userId.value });
    return ok(customerFound);
  }

  update(customer: Customer): Result<Customer, Error> {
    this.logger.debug(`InMemoryCustomerRepository.update : execute - ${customer.id.value}`, { customer: customer });
    if (!this.customers.has(customer.id.value)) {
      return err(new CustomerNotFoundException(`Customer profile not found`, { id: customer.id.value }));
    }
    this.logger.debug(`InMemoryCustomerRepository.update : success`, { customer: customer });
    this.logger.debug(`InMemoryCustomerRepository: contains ${this.customers.size}`, { customers: this.customers });
    this.customers.set(customer.id.value, customer);

    return ok(customer);
  }
}
