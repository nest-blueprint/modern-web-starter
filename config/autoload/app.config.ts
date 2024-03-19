import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { join } from 'path';

export const appConfig = () => {
  const env = config();
  expand(env);
  return {
    application: {
      PORT: 3000,
      DEBUG: process.env.DEBUG === 'true',
      CACHE: process.env.CACHE === 'true',
      OPENAPI_REQUEST_VALIDATION: process.env.OPENAPI_REQUEST_VALIDATION === 'true',
      API_SPECS: join(__dirname, '../..', '/module/core/config/api-specification/reference/the_mentor.v1.yaml'),
      NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      STACK_TRACE: process.env.STACK_TRACE === 'true',
    },
    database: {
      dialect: 'mysql',
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT) || 3306,
    },
    auth0: {
      issuerUrl: process.env.AUTH0_ISSUER_URL,
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: process.env.AUTH0_SCOPE,
    },
  };
};
