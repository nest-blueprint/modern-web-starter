import { CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandlerInterface } from '../../../../src/application/interface/command-handler.interface';
import { CommandInterface } from '../../../../src/application/interface/command.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Execute commands like SequelizeTransactionDelegator but without handling transaction.
// Required for route unit testing.

@Injectable()
export class TransactionDelegator implements CommandHandlerInterface {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private commandBus: CommandBus) {}

  async execute(command: CommandInterface | CommandInterface[]): Promise<null> {
    if (Array.isArray(command)) {
      this.logger.debug(`TransactionDelegator: start executing ${command.length} commands.`);
      for (const subCommand of command) {
        this.logger.debug(`TransactionDelegator:  executing command ${subCommand.constructor.name}`, { subCommand });
        await this.commandBus.execute(subCommand);
        this.logger.debug('TransactionDelegator: execution completed.');
      }
      return;
    }

    await this.commandBus.execute(command);
    return null;
  }
}
