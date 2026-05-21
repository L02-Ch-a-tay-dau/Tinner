const fs = require("fs");
const path = require("path");

module.exports = function expoBabelConfig(api) {
  api.cache(true);
  // #region agent log
  let presetResolvable = false;
  let presetResolveError = "";
  try {
    require.resolve("babel-preset-expo");
    presetResolvable = true;
  } catch (e) {
    presetResolveError = e instanceof Error ? e.message : String(e);
  }
  try {
    const logLine = JSON.stringify({
      sessionId: "4f4bb7",
      hypothesisId: "A",
      location: "apps/mobile/babel.config.js",
      message: "babel-preset-expo require.resolve before presets load",
      data: { presetResolvable, presetResolveError },
      timestamp: Date.now(),
    });
    fs.appendFileSync(path.join(__dirname, "..", "..", "debug-4f4bb7.log"), `${logLine}\n`);
  } catch (_) {}
  fetch("http://127.0.0.1:7916/ingest/180c084f-7e5e-4ecc-991d-71da483481af", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4f4bb7" },
    body: JSON.stringify({
      sessionId: "4f4bb7",
      hypothesisId: "A",
      location: "apps/mobile/babel.config.js",
      message: "babel-preset-expo require.resolve before presets load",
      data: { presetResolvable, presetResolveError },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return {
    presets: ["babel-preset-expo"],
  };
};
