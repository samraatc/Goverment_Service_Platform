import morgan from 'morgan';
import { stream } from '../utils/logger';
import { ENV } from '../config/env';

export const requestLogger = morgan(
  ENV.IS_PRODUCTION
    ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
    : 'dev',
  { stream }
);
