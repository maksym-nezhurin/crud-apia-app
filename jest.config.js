export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.m?js$': 'babel-jest',
    },
    // extensionsToTreatAsEsm: ['.mjs'], // Treat .mjs files as ESM
    testMatch: ['<rootDir>/test/**/*.test.mjs'], // Adjust this pattern,
    setupFiles: ["<rootDir>/jest.setup.mjs"],
};