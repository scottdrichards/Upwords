/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths:["src","node_modules"],
  moduleNameMapper:{
    "\../../../shared/(.*)":"<rootDir>/../shared/$1",
    // "tslib" : "<rootDir>/node_modules/tslib/tslib.d.ts",
  },
  collectCoverageFrom:["<rootDir>/src/**/*.{js,ts}"]
};
