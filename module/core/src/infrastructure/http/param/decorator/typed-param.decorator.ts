import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InvalidValueProvidedException } from '../../../exception/invalid-value-provided.exception';
import { TypeGuardError } from 'typia';
import assert from 'assert';

export const TypedQueryParam = createParamDecorator(
  (
    data: {
      name: string;
      type: ParamType;
      nullable?: boolean;
      assertFunction?: (value: any) => number | string | boolean | unknown | object;
    },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();

    if (data.nullable) {
      if (request.query?.[data.name] === undefined || request.query?.[data.name] === null) {
        return undefined;
      }

      if (request.query?.[data.name] && !data.assertFunction) {
        return typeCheckers[data.type](request.query[data.name]);
      }

      return validateUsingAssertFunction(request.query?.[data.name], data.assertFunction);
    }

    if (!data.nullable) {
      if (request.query?.[data.name] === undefined || request.query?.[data.name] === null) {
        throw new InvalidValueProvidedException(`Missing required query parameter: ${data.name}`);
      }

      if (request.query?.[data.name] && data.assertFunction) {
        return validateUsingAssertFunction(request.query?.[data.name], data.assertFunction);
      }

      return typeCheckers[data.type](request.query[data.name]);
    }
  },
);

export type ParamType = 'string' | 'number' | 'boolean' | 'uuid' | 'any' | 'array';

const typeCheckers = {
  string: (value: unknown) => {
    if (typeof value === 'string') {
      return value;
    }
    throw new InvalidValueProvidedException(`Invalid query parameter: ${value}. Expected : "string"`);
  },
  number: (value: unknown) => {
    validateUsingAssertFunction(value, (value) => {
      assert(
        !isNaN(Number(value)),
        new InvalidValueProvidedException(`Invalid query parameter: ${value}. Expected : "number"`),
      );
      return Number(value);
    });
  },
  boolean: (value: unknown) => {
    validateUsingAssertFunction(value, (value) => {
      assert(
        value === 'true' || value === 'false',
        new InvalidValueProvidedException(`Invalid query parameter: ${value}. Expected : "boolean"`),
      );
      return Boolean(value);
    });
  },
  uuid: (value: unknown) => {
    assert(isUUID(value), new InvalidValueProvidedException(`Invalid query parameter: ${value}. Expected : "uuid"`));
    return value;
  },
  any: (value: unknown): value is any => true,
  array: (value: unknown) => {
    validateUsingAssertFunction(value, (value) => {
      const transformedArray = typeof value === 'string' ? value.split(',') : value;
      assert(
        Array.isArray(transformedArray) &&
          transformedArray.length > 0 &&
          transformedArray.every((item) => item.length > 0),
        new InvalidValueProvidedException(`Invalid query parameter: ${value}. Expected : "array"`),
      );
      return transformedArray;
    });
  },
};

const validateUsingAssertFunction = (value: any, assertFunction: (value: any) => void) => {
  try {
    return assertFunction(value);
  } catch (exp) {
    if (exp instanceof TypeGuardError) {
      throw new InvalidValueProvidedException(
        `Invalid query parameter ${exp.path}.Expected ${exp.expected} but got ${exp.value}`,
      );
    }
    throw exp;
  }
};
