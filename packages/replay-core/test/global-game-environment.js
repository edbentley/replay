const NodeEnvironment = require("jest-environment-node");

// This is compiled from the TS file on npm run build-test so that we can set it
// in the JS environment
const { TestGame, gameProps } = require("./build/__tests__/utils");

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    // Simulate global game variable, like in iOS
    this.global.game = {
      Game: TestGame,
      gameProps,
    };
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
