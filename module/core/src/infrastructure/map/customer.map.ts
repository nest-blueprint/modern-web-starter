import { plainToInstance, Transform } from 'class-transformer';
import { err, ok, Result } from 'neverthrow';
import { Id as UserId } from '../../domain/user/id';
import { Id as CustomerId } from '../../domain/customer/id';
import { Type as CustomerType } from '../../domain/customer/type';
import { Customer } from '../../domain/customer';
import { Customer as CustomerRaw } from '../type/raw/customer.raw';
import { Customer as CustomerEntity } from '../sequelize/entity/customer.entity';
import { Id as MentorId } from '../../domain/mentor/id';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { User as UserEntity } from '../sequelize/entity/user.entity';
import { UserMap } from './user.map';
import { User } from '../../domain/user';

export class CustomerMap {
  @Transform(({ value }) => new CustomerId(value))
  customer_id: string;

  @Transform(({ value }) => new UserId(value))
  user_id: string;

  @Transform(({ value }) => new CustomerType(value))
  type: CustomerType;

  @Transform(({ value }) => value.map((id) => new MentorId(id)))
  bookmarked_mentors: MentorId[];

  profile_description: string;

  @Transform(({ value }) => UserMap.toDomain(value))
  user: UserEntity;

  static toDomain(customer: CustomerRaw): Result<Customer, Error>;
  static toDomain(customer: CustomerEntity): Result<Customer, Error>;
  static toDomain(customer: CustomerRaw | CustomerEntity): Result<Customer, Error> {
    try {
      if (customer instanceof CustomerEntity) {
        const mappedData = plainToInstance(CustomerMap, customer.dataValues);

        const { customer_id, user, type, bookmarked_mentors, profile_description } = <
            {
              customer_id: CustomerId;
              user: User;
              type: CustomerType;
              bookmarked_mentors: MentorId[] | undefined;
              profile_description: string;
            }
          >(<unknown>mappedData) || {};

        const mappedCustomer = new Customer(customer_id, user, type, profile_description, bookmarked_mentors ?? []);

        return ok(mappedCustomer);
      }
      if (CustomerMap.containsNeededKeys(customer)) {
        const id = new CustomerId(customer.customer_id);

        const userResult = UserMap.toDomain(customer.user);

        if (userResult.isErr()) {
          return err(userResult.error);
        }

        const type = new CustomerType(customer.type);
        const profileDescription = customer.profile_description;

        const bookmarkedMentors = customer.bookmarked_mentors
          ? customer.bookmarked_mentors.map((id) => new MentorId(id))
          : [];

        const mappedCustomer = new Customer(id, userResult.value, type, profileDescription, bookmarkedMentors);

        return ok(mappedCustomer);
      }
      return err(
        new RuntimeErrorException('Failed to map customer', {
          method: 'CustomerMap.toDomain',
          input: customer,
        }),
      );
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map customer.Unexpected exception while trying to map the customer', {
          method: 'CustomerMap.toDomain',
          input: customer,
        }),
      );
    }
  }

  static toEntity(customer: Customer): CustomerEntity {
    return plainToInstance(CustomerEntity, CustomerMap.toJSON(customer));
  }

  static toJSON(customer: Customer) {
    return {
      customer_id: customer.id.value,
      user: UserMap.toJSON(customer.user),
      type: customer.customerType.value,
      role: customer.customerType.value,
      profile_description: customer.profileDescription,
      bookmarked_mentors: customer.bookmarkedMentors.map((id) => id.value),
    };
  }

  static toRaw(customer: Customer): CustomerRaw {
    // Remark: no need to split bookmarked mentors into a string, since it is a related to an
    //  associative table in the database (between customer and mentor)
    return {
      customer_id: customer.id.value,
      user: UserMap.toRaw(customer.user),
      type: customer.customerType.value,
      profile_description: customer.profileDescription,
      bookmarked_mentors: customer.bookmarkedMentors.map((id) => id.value),
    };
  }

  static containsNeededKeys(customer: CustomerRaw): boolean {
    return (['customer_id', 'user', 'type', 'profile_description'] as Array<keyof CustomerRaw>).every((key) =>
      Object.keys(customer).includes(key),
    );
  }
}
