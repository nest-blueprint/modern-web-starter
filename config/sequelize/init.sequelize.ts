// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize-typescript';
import conf from './config.sequelize';
import { Person } from '../../module/core/src/infrastructure/sequelize/entity/person.entity';
import { User } from '../../module/core/src/infrastructure/sequelize/entity/user.entity';
import { Skill } from '../../module/core/src/infrastructure/sequelize/entity/skill.entity';
import { Mentor } from '../../module/core/src/infrastructure/sequelize/entity/mentor.entity';
import { PricingPlan } from '../../module/core/src/infrastructure/sequelize/entity/pricing-plan.entity';
import { ProfessionalExperience } from '../../module/core/src/infrastructure/sequelize/entity/professional-experience.entity';
import { MentorSkill } from '../../module/core/src/infrastructure/sequelize/entity/mentor-skill.entity';
import { MentorSettings } from '../../module/core/src/infrastructure/sequelize/entity/mentor-settings.entity';
import { Customer } from '../../dist/module/core/src/infrastructure/sequelize/entity/customer.http-handler';
import { CustomerBookmarkedMentors } from '../../module/core/src/infrastructure/sequelize/entity/customer-bookmarked-mentors.entity';

const params = conf.development;

const sequelize = new Sequelize({
  ...params,
  models: [
    Person,
    User,
    Mentor,
    PricingPlan,
    ProfessionalExperience,
    Skill,
    MentorSkill,
    MentorSettings,
    Customer,
    CustomerBookmarkedMentors,
  ],
});
sequelize
  .sync({ force: true })
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((sequelizeError) => {
    console.error(sequelizeError);
    fs.writeFile(path.join(__dirname, 'error_sync.json'), JSON.stringify(sequelizeError));
  });
