module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!axios)"
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js"
  }
};
