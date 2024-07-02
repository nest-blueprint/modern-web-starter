import { Inject, Injectable } from '@nestjs/common';
import { CustomerCollection } from '../../domain/collection/customer.collection';
import { Customer } from '../../domain/customer';
import { Id as CustomerId } from '../../domain/customer/id';
import { Id as UserId } from '../../domain/user/id';
import { storage } from '../storage/storage';
import { err, ok, Result } from 'neverthrow';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { SequelizeToken } from '../sequelize/token/sequelize.token';
import { Repository, Sequelize } from 'sequelize-typescript';
import { Customer as CustomerEntity } from '../sequelize/entity/customer.entity';
import { Transaction } from 'sequelize';
import { CustomerAlreadyExistsException } from '../exception/customer-already-exists.exception';
import { CustomerMap } from '../map/customer.map';
import { CustomerNotFoundException } from '../exception/customer-not-found.exception';
import { Mentor } from '../sequelize/entity/mentor.entity';

@Injectable()
export class CustomerRepository implements CustomerCollection {
  private readonly customers: Repository<CustomerEntity>;
  constructor(@Inject(SequelizeToken) private readonly sequelize: Sequelize) {
    this.customers = this.sequelize.getRepository(CustomerEntity);
  }

  async add(customer: Customer): Promise<Result<Customer, Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      const customerWithSameId = await this.customers.findByPk(customer.id.value, { transaction });

      if (customerWithSameId) {
        return err(new CustomerAlreadyExistsException('Customer with the same records already exists.'));
      }

      const customerEntity = CustomerMap.toEntity(customer);
      const result = await customerEntity.save({ transaction });
      const mappedNewCustomerResult = CustomerMap.toDomain(result);

      if (mappedNewCustomerResult.isErr()) {
        return err(mappedNewCustomerResult.error);
      }
      return ok(mappedNewCustomerResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async delete(id: CustomerId): Promise<Result<Customer, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const customerWithSameId = await this.customers.findByPk(id.value, { transaction });
      if (!customerWithSameId) {
        return err(new CustomerNotFoundException(`Customer with id ${id.value} not found.`));
      }

      await this.customers.destroy({
        where: {
          customer_id: id.value,
        },
        transaction,
      });

      const mappedDeletedCustomerResult = CustomerMap.toDomain(customerWithSameId);

      if (mappedDeletedCustomerResult.isErr()) {
        return err(mappedDeletedCustomerResult.error);
      }

      return ok(mappedDeletedCustomerResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async get(id: CustomerId): Promise<Result<Customer, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const customerFromDatabase = await this.customers.findByPk(id.value, {
        transaction,
        include: [{ model: Mentor }],
      });
      if (!customerFromDatabase) {
        return err(new CustomerNotFoundException(`Customer with id ${id.value} not found.`));
      }

      const mappedCustomerResult = CustomerMap.toDomain(customerFromDatabase);

      if (mappedCustomerResult.isErr()) {
        return err(mappedCustomerResult.error);
      }

      return ok(mappedCustomerResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async getByUserId(userId: UserId): Promise<Result<Customer, Error>> {
    const transaction = storage.getStore() as Transaction;
    try {
      const customerFromDatabase = await this.customers.findOne({
        where: {
          user_id: userId.value,
        },
        include: [{ model: Mentor }],
        transaction,
      });

      if (!customerFromDatabase) {
        return err(new CustomerNotFoundException(`Customer with user id ${userId} not found.`));
      }

      const mappedCustomerResult = CustomerMap.toDomain(customerFromDatabase);

      if (mappedCustomerResult.isErr()) {
        return err(mappedCustomerResult.error);
      }

      return ok(mappedCustomerResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async count(): Promise<Result<number, Error>> {
    const transaction = storage.getStore() as Transaction;

    try {
      const count = await this.customers.count({ transaction });
      return ok(count);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }

  async update(customer: Customer) {
    const transaction = storage.getStore() as Transaction;
    try {
      const customerFromDatabase = await this.customers.findByPk(customer.id.value, {
        transaction,
        include: [{ model: Mentor }],
      });

      if (!customerFromDatabase) {
        return err(new CustomerNotFoundException(`Customer with id ${customer.id.value} not found.`));
      }

      const customerEntity = CustomerMap.toEntity(customer);
      await this.customers.update(customerEntity, {
        where: {
          customer_id: customer.id.value,
        },
        transaction,
      });

      const mappedUpdatedCustomerResult = CustomerMap.toDomain(customerEntity);

      if (mappedUpdatedCustomerResult.isErr()) {
        return err(mappedUpdatedCustomerResult.error);
      }

      return ok(mappedUpdatedCustomerResult.value);
    } catch (error: any) {
      return err(new RuntimeErrorException(error.message, error));
    }
  }
}
