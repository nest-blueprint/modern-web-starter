import { UuidArrayType } from '../type/uuid-array.type';
import { assert } from 'typia';

export function uuidArrayTypeAssert(value: any) {
  const transformedValue = typeof value === 'string' ? value.split(',') : value;
  const typedValue: UuidArrayType = {
    ids: transformedValue,
  };
  assert<UuidArrayType>(typedValue);
  return transformedValue;
}
