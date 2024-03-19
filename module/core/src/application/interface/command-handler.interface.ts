import { CommandInterface } from './command.interface';

export interface CommandHandlerInterface {
  execute(command: CommandInterface): Promise<void>;
}
