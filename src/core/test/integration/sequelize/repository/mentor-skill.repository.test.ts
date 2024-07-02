import { Test } from '@nestjs/testing';
import { SequelizeProvider } from '../../../../src/infrastructure/sequelize/sequelize.provider';
import { Sequelize } from 'sequelize-typescript';
import { MentorSkill as MentorSkillEntity } from '../../../../src/infrastructure/sequelize/entity/mentor-skill.entity';
import { SequelizeToken } from '../../../../src/infrastructure/sequelize/token/sequelize.token';
import { ConfigLoaderToken } from '../../../../src/infrastructure/init/token.init';
import { appConfig } from '../../../../../../config/autoload/app.config';
import { ConfigLoaderService } from '../../../../src/infrastructure/init/service/config-loader.service';

describe('[Core/Infrastructure] SequelizeMentorSkillRepository', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: ConfigLoaderToken,
          useFactory: () => {
            const config = appConfig();
            return new ConfigLoaderService(config);
          },
        },
        SequelizeProvider,
      ],
    }).compile();

    sequelize = module.get(SequelizeToken);
  });

  it('SequelizeProvider should be defined and instanced', () => {
    expect(sequelize).toBeDefined();
    expect(sequelize).toBeInstanceOf(Sequelize);
  });

  it('Sequelize MentorSkill Repository can be instanced', () => {
    const sequelizeUserRepository = sequelize.getRepository(MentorSkillEntity);
    expect(sequelizeUserRepository).toBeDefined();
  });
});
