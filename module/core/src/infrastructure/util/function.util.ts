import { err, ok, Result } from 'neverthrow';
import { Period } from '../../domain/professional-experience/period';
import { InvalidValueProvidedException } from '../exception/invalid-value-provided.exception';
import { number } from 'currency-codes';
import * as path from 'path';

/** from https://stackoverflow.com/questions/43781215/recursively-remove-undefined-from-object-including-parent **/
// eslint-disable-next-line @typescript-eslint/ban-types
export function cleanObject(obj: any) {
  Object.keys(obj).forEach(function (key) {
    // Get this value and its type
    const value = obj[key];
    const type = typeof value;
    if (type === 'object') {
      // Recurse...
      cleanObject(value);
      // ...and remove if now "empty" (NOTE: insert your definition of "empty" here)
      if (!Object.keys(value).length) {
        delete obj[key];
      }
    } else if (type === 'undefined') {
      // Undefined, remove it
      delete obj[key];
    }
  });
}
/** from https://stackoverflow.com/questions/30521224/javascript-convert-pascalcase-to-underscore-case-snake-case **/
export function toSnakeCase(str: string): string {
  return str
    .replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
      return '_' + y.toLowerCase();
    })
    .replace(/^_/, '');
}

export function match<T, E>(result: Result<T, E>, options: MatchInterfaceOptions<T, E>) {
  return result.isOk() ? options.success(result.value) : options.failure(result.error);
}

export interface MatchInterfaceOptions<T, E> {
  success: (t: T) => any;
  failure: (e: E) => any;
}

export function splitAndClean(str: string, symbol = ',') {
  if (typeof str !== 'string') {
    throw new InvalidValueProvidedException('Invalid value provided', {
      method: 'splitAndClean',
      input: str,
      expected: 'string',
    });
  }
  const strToArray = str.split(symbol).filter((e) => e.length !== 0);
  return strToArray;
}

export function iterateObjectRecursively(
  obj: any,
  callback: (key: string, value: any, path?: string) => void,
  path = '',
) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'object') {
        iterateObjectRecursively(value, callback, path + '.' + key);
      } else {
        callback(key, value, path);
      }
    }
  }
}

/**
 * Access a property of an object by a path.
 * @param o
 * @param s
 */
export function getProperty(o: any, s: string) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}

export function overlapThesePeriods(period: Period, periods: Period[]) {
  return periods.some((p) => p.overlap(period));
}
export function toSentenceCase(str: string): string {
  return str
    .replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
      return ' ' + y.toLowerCase();
    })
    .replace(/^_/, '')
    .replace('exception', '')
    .trim();
}

function isInteger(value: any) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function tryParseInt(value: number | string, path?: string) {
  if (isInteger(value)) {
    return ok(value);
  }
  if (typeof value === 'string') {
    try {
      return ok(parseInt(value, 10));
    } catch (error) {
      return err({ path, expected: 'integer', value });
    }
  }
  return err({ path, expected: 'integer', value });
}
