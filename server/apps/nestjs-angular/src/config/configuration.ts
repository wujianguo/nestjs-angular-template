import { parseConfig, AdminAuthConfig } from '@app/user';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export interface SqliteConfig {
  database: string;
}

export interface DatabaseConfig {
  sqlite?: SqliteConfig;
}

export interface CommonConfig {
  debug: boolean;
  version: string;
}

export interface Configuration {
  common: CommonConfig;
  db: DatabaseConfig;
  auth: AdminAuthConfig;
}

const YAML_CONFIG_FILENAME = process.env.CONFIG_FILE || 'config/config.yaml';

export const loadConfig = (): Configuration => {
  const conf = yaml.load(readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8')) as Record<string, any>;
  const common = {
    debug: conf.common?.debug || 0 > 0,
    version: process.env.npm_package_version || '0.0.1',
  };
  const database = {
    sqlite: {
      database: conf.db.sqlite.database,
    },
  };
  const auth = parseConfig(conf.auth as Record<string, any>);
  return {
    common: common,
    db: database,
    auth: auth,
  };
};
