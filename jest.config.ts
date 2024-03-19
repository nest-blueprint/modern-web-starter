import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  moduleDirectories: ['<rootDir>/node_modules'],
  modulePaths: ['<rootDir>/module/'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  transform: {
    '\\.ts': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    'node_modules',
    '<rootDir>/module/core/src/domain/exception',
    '<rootDir>/module/core/src/infrastructure/command',
    '<rootDir>/module/core/src/infrastructure/query',
    '<rootDir>/module/core/src/infrastructure/resource',
    '<rootDir>/module/core/test/',
  ],
  coverageDirectory: './coverage/',
  coverageReporters: ['html'],
};
export default config;
