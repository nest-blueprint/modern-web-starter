import { Sequelize } from 'sequelize-typescript';
import { SequelizeToken } from './token/sequelize.token';
import { ConfigLoaderToken } from '../init/token.init';
import { User } from './entity/user.entity';
import { Mentor } from './entity/mentor.entity';
import { Person } from './entity/person.entity';
import { Skill } from './entity/skill.entity';
import { MentorSkill } from './entity/mentor-skill.entity';
import { PricingPlan } from './entity/pricing-plan.entity';
import { ProfessionalExperience } from './entity/professional-experience.entity';
import { MentorSettings } from './entity/mentor-settings.entity';
import { ConfigLoaderService } from '../init/service/config-loader.service';
import { Customer } from './entity/customer.entity';
import { CustomerBookmarkedMentors } from './entity/customer-bookmarked-mentors.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export const SequelizeProvider = {
  provide: SequelizeToken,
  providers: [],
  inject: [WINSTON_MODULE_PROVIDER, ConfigLoaderToken],
  useFactory: async (logger: Logger, configLoaderService: ConfigLoaderService) => {
    const databaseConfiguration = configLoaderService.get('database');
    const sequelize = new Sequelize({
      ...databaseConfiguration,
      repositoryMode: false,
      logging: (message) => logger.silly(message),
    });
    sequelize.addModels([
      User,
      Mentor,
      Person,
      Skill,
      MentorSkill,
      PricingPlan,
      ProfessionalExperience,
      MentorSettings,
      Customer,
      CustomerBookmarkedMentors,
    ]);

    const environment = configLoaderService.get('application.NODE_ENV');
    if (environment === 'development') {
      await sequelize.sync({ force: true, alter: true });
      return sequelize;
    }

    await sequelize.sync();

    return sequelize;
  },
};
