/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomerType } from './customer-type.entity';

export type Customer = {
  type: CustomerType;
  /**
   * @format uuid
   */
  bookmarked_mentors?: Array<{
    /**
     * Id of the object. Id is an uuid
     */
    id?: string;
  }>;
};
