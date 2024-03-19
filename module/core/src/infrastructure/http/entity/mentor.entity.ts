/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AvailabilityType } from './availability-type.entity';
import type { CourseType } from './course-type.entity';

export type Mentor = {
  /**
   * 639-1 ISO lang format
   * @minItems 1
   */
  languages: Array<{
    language?:
      | 'ab'
      | 'aa'
      | 'af'
      | 'ak'
      | 'sq'
      | 'am'
      | 'ar'
      | 'an'
      | 'hy'
      | 'as'
      | 'av'
      | 'ae'
      | 'ay'
      | 'az'
      | 'bm'
      | 'ba'
      | 'eu'
      | 'be'
      | 'bn'
      | 'bi'
      | 'bs'
      | 'br'
      | 'bg'
      | 'my'
      | 'ca'
      | 'ch'
      | 'ce'
      | 'ny'
      | 'zh'
      | 'cv'
      | 'kw'
      | 'co'
      | 'cr'
      | 'hr'
      | 'cs'
      | 'da'
      | 'dv'
      | 'nl'
      | 'dz'
      | 'en'
      | 'eo'
      | 'et'
      | 'ee'
      | 'fo'
      | 'fj'
      | 'fi'
      | 'fr'
      | 'ff'
      | 'gl'
      | 'ka'
      | 'de'
      | 'el'
      | 'gn'
      | 'gu'
      | 'ht'
      | 'ha'
      | 'he'
      | 'hz'
      | 'hi'
      | 'ho'
      | 'hu'
      | 'ia'
      | 'id'
      | 'ie'
      | 'ga'
      | 'ig'
      | 'ik'
      | 'io'
      | 'is'
      | 'it'
      | 'iu'
      | 'ja'
      | 'jv'
      | 'kl'
      | 'kn'
      | 'kr'
      | 'ks'
      | 'kk'
      | 'km'
      | 'ki'
      | 'rw'
      | 'ky'
      | 'kv'
      | 'kg'
      | 'ko'
      | 'ku'
      | 'kj'
      | 'la'
      | 'lb'
      | 'lg'
      | 'li'
      | 'ln'
      | 'lo'
      | 'lt'
      | 'lu'
      | 'lv'
      | 'gv'
      | 'mk'
      | 'mg'
      | 'ms'
      | 'ml'
      | 'mt'
      | 'mi'
      | 'mr'
      | 'mh'
      | 'mn'
      | 'na'
      | 'nv'
      | 'nd'
      | 'ne'
      | 'ng'
      | 'nb'
      | 'nn'
      | 'no'
      | 'ii'
      | 'nr'
      | 'oc'
      | 'oj'
      | 'cu'
      | 'om'
      | 'or'
      | 'os'
      | 'pa'
      | 'pi'
      | 'fa'
      | 'pl'
      | 'ps'
      | 'pt'
      | 'qu'
      | 'rm'
      | 'rn'
      | 'ro'
      | 'ru'
      | 'sa'
      | 'sc'
      | 'sd'
      | 'se'
      | 'sm'
      | 'sg'
      | 'sr'
      | 'gd'
      | 'sn'
      | 'si'
      | 'sk'
      | 'sl'
      | 'so'
      | 'st'
      | 'es'
      | 'su'
      | 'sw'
      | 'ss'
      | 'sv'
      | 'ta'
      | 'te'
      | 'tg'
      | 'th'
      | 'ti'
      | 'bo'
      | 'tk'
      | 'tl'
      | 'tn'
      | 'to'
      | 'tr'
      | 'ts'
      | 'tt'
      | 'tw'
      | 'ty'
      | 'ug'
      | 'uk'
      | 'ur'
      | 'uz'
      | 've'
      | 'vi'
      | 'vo'
      | 'wa'
      | 'cy'
      | 'wo'
      | 'fy'
      | 'xh'
      | 'yi'
      | 'yo'
      | 'za'
      | 'zu';
  }>;

  /**
   * @minItems 1
   * @minLength 1
   * @maxLength 20
   */
  skills: Array<string>;

  /**
   * @minLength 3
   * @maxLength 50
   */
  profile_title?: string;

  /**
   * @maxLength 500
   */
  profile_description?: string;
  availability_type: AvailabilityType;

  /**
   * @minItems 1
   * @maxItems 2
   */
  course_type: Array<CourseType>;

  /**
   * @format uuid
   */
  experience_ids?: Array<string>;

  /**
   * @format uuid
   */
  pricing_plan_ids?: Array<string>;

  /**
   * @minLength 3
   * @maxLength 50
   */
  current_job_title?: string;
};
