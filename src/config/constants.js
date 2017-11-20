const isProduction = process.env.NODE_ENV === "production";
const isQa = process.env.NODE_ENV === "qa";
const appVersion = '1.0.0'
const callRetries = 3;
const cacheAPIHeader = 180;
const assetsExpiry = 30 * 86400 * 1000; // 30 days
const bundleExpiry = 1800;//30 minutes
const CtoSTimeout = isProduction ? 10000 : 21000;
const StoSTimeout = isProduction ? 3000 : 21000;

export {bundleExpiry, isProduction, CtoSTimeout, StoSTimeout, callRetries,isQa, cacheAPIHeader, assetsExpiry, appVersion};
