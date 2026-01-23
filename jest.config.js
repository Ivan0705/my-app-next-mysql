const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    "^@/(.*)$": "<rootDir>/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@lib/(.*)$": "<rootDir>/lib/$1",
    "^@app/(.*)$": "<rootDir>/app/$1",
    "^@processes/(.*)$": "<rootDir>/processes/$1",
    "^@entities/(.*)$": "<rootDir>/entities/$1",
    "^@features/(.*)$": "<rootDir>/features/$1",
    "^@widgets/(.*)$": "<rootDir>/widgets/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@pages/(.*)$": "<rootDir>/pages/$1",
  },

  testMatch: [
    "<rootDir>/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/**/*.spec.{js,jsx,ts,tsx}",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
  ],
};

module.exports = createJestConfig(customJestConfig);
