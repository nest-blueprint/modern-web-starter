import { cleanObject, splitAndClean } from '../../../src/infrastructure/util/function.util';

describe('[Core/Infrastructure] Util', () => {
  test('cleanObject', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: {
        c1: undefined,
        c2: 2,
      },
      d: {
        d1: undefined,
        d2: undefined,
      },
    };
    const cleanedObjectRef = { ...obj };
    cleanObject(cleanedObjectRef);
    expect(cleanedObjectRef).toEqual({
      a: 1,
      c: {
        c2: 2,
      },
    });
  });

  test('splitAndClean', () => {
    const str1 = 'a,b,c';
    const str2 = 'a,b,c,';
    const str3 = ',a,b,c,d,e,';
    const splittedStr1 = splitAndClean(str1);
    const splittedStr2 = splitAndClean(str2);
    const splittedStr3 = splitAndClean(str3);
    expect(splittedStr1).toEqual(['a', 'b', 'c']);
    expect(splittedStr2).toEqual(['a', 'b', 'c']);
    expect(splittedStr3).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
