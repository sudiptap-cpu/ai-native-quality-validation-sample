const npxCache = '/workspace/.npm/_npx/997bc09062a3982d/node_modules';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  modulePaths: [npxCache],
  moduleDirectories: ['node_modules', npxCache],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: false,
      tsconfig: {
        typeRoots: [`${npxCache}/@types`],
        baseUrl: '.',
        paths: {
          'supertest': [`${npxCache}/supertest`],
          '@types/supertest': [`${npxCache}/@types/supertest`],
          '@types/jest': [`${npxCache}/@types/jest`],
        }
      }
    }]
  }
};
