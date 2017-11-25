const isProduction = process.env.NODE_ENV === "production";
const enableTestLogs = (process.env.NODE_LOGS === "true");
const isQa = process.env.NODE_ENV === "qa";
const appVersion = '1.0.0'
const callRetries = 3;
const assetsExpiry = 30 * 86400 * 1000; // 30 days
const bundleExpiry = 1800;//30 minutes
const CtoSTimeout = isProduction ? 10000 : 129000;
const StoSTimeout = isProduction ? 3000 : 129000;

//Instrumentation constants are in src/lib/instrumentation.js

export {
  enableTestLogs,
  bundleExpiry,
  isProduction,
  CtoSTimeout,
  StoSTimeout,
  callRetries,
  isQa,
  assetsExpiry,
  appVersion,
};

