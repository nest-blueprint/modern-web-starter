/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ProfessionalExperience = {
  /**
   * @minLength 3
   * @maxLength 50
   */
  title: string;

  /**
   * @minLength 3
   * @maxLength 50
   * */
  company: string;
  /**
   * Iso 8601 Date
   */

  start_date: string;
  /**
   * Iso 8601 Date
   */
  end_date: string;
};
