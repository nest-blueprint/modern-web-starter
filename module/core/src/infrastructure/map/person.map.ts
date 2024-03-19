import { Exclude, plainToInstance, Transform } from 'class-transformer';
import { Person as PersonEntity } from '../sequelize/entity/person.entity';
import { User as UserEntity } from '../sequelize/entity/user.entity';
import { Id as PersonId } from '../../domain/person/id';
import { Id as UserId } from '../../domain/user/id';
import { Person } from '../../domain/person';
import { Person as PersonRaw } from '../type/raw/person.raw';
import { PhoneNumber } from '../../domain/person/phone-number';
import { err, ok, Result } from 'neverthrow';
import { RuntimeErrorException } from '../exception/runtime-error.exception';
import { LinkedinProfileUrl } from '../type/linkedin-profile-url.type';

export class PersonMap {
  firstname: string | null;
  google_place_id: string | null;
  lastname: string | null;

  @Transform(({ value }) => {
    if (value) return new LinkedinProfileUrl(value);
  })
  linkedin: string | null;
  nickname: string | null;

  @Transform(({ value }) => new PersonId(value))
  person_id: string;

  @Transform(({ value }) => {
    if (value) return PhoneNumber.fromString(value);
  })
  phone_number: string | null;

  profile_photo: string | null;

  @Exclude()
  user: UserEntity;

  @Transform(({ value }) => new UserId(value))
  user_id: string;

  static toDomain(person: PersonRaw): Result<Person, Error>;
  static toDomain(person: PersonEntity): Result<Person, Error>;
  static toDomain(person: PersonEntity | PersonRaw): Result<Person, Error> {
    try {
      if (person instanceof PersonEntity) {
        const mappedData = <never>plainToInstance(PersonMap, person.dataValues);
        const {
          firstname,
          google_place_id,
          lastname,
          linkedin,
          nickname,
          phone_number,
          profile_photo,
          person_id,
          user_id,
        } = mappedData || {};
        const mappedPerson = new Person(
          person_id,
          user_id,
          firstname,
          lastname,
          phone_number,
          nickname,
          linkedin,
          google_place_id,
          profile_photo,
        );
        return ok(mappedPerson);
      }
      if (PersonMap.containsNeededKey(person)) {
        const id = new PersonId(person.person_id);
        const userId = person.user_id ? new UserId(person.user_id) : undefined;
        const firstname = person.firstname;
        const lastname = person.lastname;
        const phoneNumber = person.phone_number ? PhoneNumber.fromString(person.phone_number) : undefined;
        const nickname = person.nickname;
        const linkedin = person.linkedin ? new LinkedinProfileUrl(person.linkedin) : undefined;
        const googlePlaceId = person.google_place_id;
        const profilePhoto = person.profile_photo;
        const mappedPerson = new Person(
          id,
          userId,
          firstname,
          lastname,
          phoneNumber,
          nickname,
          linkedin,
          googlePlaceId,
          profilePhoto,
        );
        return ok(mappedPerson);
      }
      return err(new RuntimeErrorException('Failed to map person', { input: person, method: 'PersonMap.toDomain' }));
    } catch (error: any) {
      return err(
        new RuntimeErrorException('Failed to map person', { error, method: 'PersonMap.toDomain', input: person }),
      );
    }
  }

  private static containsNeededKey(person: PersonRaw) {
    return ['person_id', 'user_id'].every((key) => Object.keys(person).includes(key));
  }

  static toJSON(person: Person) {
    return this.toRawObject(person);
  }

  static toRawObject(person: Person): PersonRaw {
    return {
      person_id: person.id.value,
      user_id: person.userId.value ?? null,
      firstname: person.firstname ?? null,
      lastname: person.lastname ?? null,
      phone_number: person.phoneNumber ? person.phoneNumber.value : null,
      nickname: person.nickname ?? null,
      linkedin: person.linkedin ? person.linkedin.value : null,
      google_place_id: person.googlePlaceId ?? null,
      profile_photo: person.profilePhoto ?? null,
    };
  }

  static toEntity(person: Person): PersonEntity {
    const personEntity = new PersonEntity();
    personEntity.person_id = person.id.value;
    personEntity.user_id = person.userId.value ?? null;
    personEntity.firstname = person.firstname ?? null;
    personEntity.lastname = person.lastname ?? null;
    personEntity.phone_number = person.phoneNumber ? person.phoneNumber.value : null;
    personEntity.nickname = person.nickname ?? null;
    personEntity.linkedin = person.linkedin?.value ?? null;
    personEntity.google_place_id = person.googlePlaceId ?? null;
    personEntity.profile_photo = person.profilePhoto ?? null;
    return personEntity;
  }
}
