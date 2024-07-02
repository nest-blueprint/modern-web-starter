export interface Config {
  application: {
    PORT: number;
    DEBUG: boolean;
    CACHE: boolean;
    API_SPECS: string;
    OPENAPI_REQUEST_VALIDATION: boolean;
  };
  database: {
    dialect: string;
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
  };
}
