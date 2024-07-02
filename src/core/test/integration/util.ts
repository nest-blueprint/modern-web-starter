import { Transaction } from 'sequelize';
import { storage } from '../../src/infrastructure/storage/storage';
import { Sequelize } from 'sequelize-typescript';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;

export const runSequelizeTransaction = async (
  sequelize: Sequelize,
  fn: (transaction: Transaction) => Promise<void>,
) => {
  await sequelize.transaction({ isolationLevel: ISOLATION_LEVELS.READ_UNCOMMITTED }, async (transaction) => {
    await storage.run(transaction, async () => {
      await fn(transaction);
    });
    throw new Error('rollback');
  });
};
