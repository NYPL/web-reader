import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': require.resolve('babel-jest'),
    '.(js|jsx)$': require.resolve('babel-jest'), // jest's default
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testPathIgnorePatterns: ['/playwright/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
  testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
  rootDir: '.',
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/cssStub.js',
  },
  snapshotSerializers: ['@emotion/jest/serializer'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testEnvironment: 'jsdom',
};

export default config;
