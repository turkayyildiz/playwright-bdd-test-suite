// config/env.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

const ENV = process.env.TEST_ENV ?? 'staging';

dotenv.config({ path: path.resolve(process.cwd(), `.env.${ENV}`) });

export interface EnvConfig {
  baseUrl:   string;
  users: {
    standard:    { username: string; password: string };
    problem:     { username: string; password: string };
    locked:      { username: string; password: string };
    invalid:     { username: string; password: string };
    performance: { username: string; password: string };
  };
  timeouts: {
    default:    number;
    navigation: number;
    assertion:  number;
  };
}

const config: EnvConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  users: {
    standard:    { username: process.env.USER_STANDARD  ?? 'standard_user',          password: process.env.PASSWORD ?? 'secret_sauce' },
    problem:     { username: process.env.USER_PROBLEM   ?? 'problem_user',            password: process.env.PASSWORD ?? 'secret_sauce' },
    locked:      { username: process.env.USER_LOCKED    ?? 'locked_out_user',         password: process.env.PASSWORD ?? 'secret_sauce' },
    invalid:     { username: process.env.USER_INVALID   ?? 'invalid_user',            password: process.env.PASSWORD_INVALID ?? 'wrong_password' },
    performance: { username: process.env.USER_PERF      ?? 'performance_glitch_user', password: process.env.PASSWORD ?? 'secret_sauce' },
  },
  timeouts: {
    default:    parseInt(process.env.TIMEOUT_DEFAULT    ?? '30000'),
    navigation: parseInt(process.env.TIMEOUT_NAVIGATION ?? '60000'),
    assertion:  parseInt(process.env.TIMEOUT_ASSERTION  ?? '10000'),
  },
};

export default config;
