import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  moduleDirectories: ['<rootDir>/node_modules'],
  modulePaths: ['<rootDir>/module/'],
  testMatch: ['<rootDir>/module/core/test/integration/**/*.test.ts'],
  transform: {
    '\\.ts': 'ts-jest',
  },
  testEnvironment: 'node',
};
export default config;
