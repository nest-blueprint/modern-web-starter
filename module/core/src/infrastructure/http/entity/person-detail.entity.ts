/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PersonDetail = {
  /**
   * @minLength 2
   * @maxLength 50
   */
  firstname?: string;

  /**
   * @minLength 1
   * @maxLength 50
   */
  lastname?: string;

  /**
   * @minLength 3
   * @maxLength 50
   */
  nickname?: string;
  phone_number?: string;
  location?: string;

  /**
   * @format url
   */
  linkedin?: string;
  profile_photo?: Blob | string;
};
