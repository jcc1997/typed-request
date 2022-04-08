module.exports = {
    preset: 'ts-jest',
    automock: false,
    resetMocks: false,
    testPathIgnorePatterns: ['/node_modules/', 'dist'],
    setupFiles: [
        './tests/setup.ts'
    ],
    roots: [
        './tests'
    ]
};
