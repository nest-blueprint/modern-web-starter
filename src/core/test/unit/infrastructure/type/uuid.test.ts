import { isUUID } from 'class-validator';
import { Uuid } from '../../../../src/infrastructure/type/uuid.type';

describe(' UUID infrastructure object', () => {
  test('Check if generated values are UUID', () => {
    const uuid1_v4 = 'd399400c-e663-4fd8-a690-5235923eb849';
    expect(isUUID(Uuid.random(), 4)).toBeTruthy();
    expect(isUUID(uuid1_v4, 4)).toBeTruthy();
  });
});
