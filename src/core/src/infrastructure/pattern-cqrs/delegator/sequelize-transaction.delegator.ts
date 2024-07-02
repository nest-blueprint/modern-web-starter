import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { CommandHandlerInterface } from '../../../application/interface/command-handler.interface';
import { CommandInterface } from '../../../application/interface/command.interface';
import { SequelizeToken } from '../../sequelize/token/sequelize.token';
import { CommandBus } from '@nestjs/cqrs';
import { storage } from '../../storage/storage';

@Injectable()
export class SequelizeTransactionDelegator implements CommandHandlerInterface {
  constructor(@Inject(SequelizeToken) private sequelize: Sequelize, private commandBus: CommandBus) {}

  async execute(command: CommandInterface | CommandInterface[]): Promise<null> {
    const transaction = await this.sequelize.transaction();
    try {
      if (Array.isArray(command)) {
        await storage.run(transaction, async () => {
          for (const subCommand of command) {
            await this.commandBus.execute(subCommand);
          }
          await transaction.commit();
        });
        return;
      }
      await storage.run(transaction, async () => {
        await this.commandBus.execute(command);
        await transaction.commit();
      });
    } catch (error: any) {
      await transaction.rollback();
      throw error;
    }
  }
}
