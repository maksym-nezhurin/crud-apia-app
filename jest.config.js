export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.m?js$': 'babel-jest',
    },
    // extensionsToTreatAsEsm: ['.mjs'], // Treat .mjs files as ESM
    testMatch: ['<rootDir>/test/**/*.test.mjs'], // Adjust this pattern,
    setupFiles: ["<rootDir>/jest.setup.mjs"],
    clearMocks: true,
    coverageProvider: "v8",
    testTimeout: 20000, // Timeout in milliseconds (this sets it to 10 seconds)
};