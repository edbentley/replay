const express = require("express");
const path = require("path");

module.exports = async () => {
  const app = express();
  const port = 3020;

  // Serve static files for tests
  app.use(express.static(path.join(__dirname, "test-public")));

  global.__SERVER__ = app.listen(port);
};
