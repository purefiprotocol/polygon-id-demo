import { mumbai, polygon } from './chains';

const STAGE_DASHBOARD_URL = process.env.REACT_APP_STAGE_DASHBOARD_URL;
const STAGE_ISSUER_URL = process.env.REACT_APP_STAGE_ISSUER_URL;

const PROD_DASHBOARD_URL = process.env.REACT_APP_PROD_DASHBOARD_URL;
const PROD_ISSUER_URL = process.env.REACT_APP_PROD_ISSUER_URL;

const CONFIGURED_URLS = {
  [mumbai.id]: {
    dashboard: STAGE_DASHBOARD_URL,
    issuer: STAGE_ISSUER_URL,
  },
  [polygon.id]: {
    dashboard: PROD_DASHBOARD_URL,
    issuer: PROD_ISSUER_URL,
  },
};

const DEFAULT_URLS = {
  dashboard: STAGE_DASHBOARD_URL,
  issuer: STAGE_ISSUER_URL,
};

export { CONFIGURED_URLS, DEFAULT_URLS };
