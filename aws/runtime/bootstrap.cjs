const allowedKeys = new Set([
  'MONGODB_URI', 'JWT_SECRET', 'ADMIN_PASSWORD', 'OPENAI_API_KEY', 'UPI_SUFFIX',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'PUBLIC_SITE_URL',
  'FRONTEND_ORIGIN', 'CORS_ORIGINS'
]);

async function loadConfiguration({ client, GetParameterCommand, environment = process.env }) {
  if (!environment.CONFIG_SSM_PARAMETER) throw new Error('CONFIG_SSM_PARAMETER is required.');
  const result = await client.send(new GetParameterCommand({ Name: environment.CONFIG_SSM_PARAMETER, WithDecryption: true }));
  if (result.Parameter?.Type !== 'SecureString' || !result.Parameter.Value) throw new Error('The encrypted application configuration is unavailable.');
  const config = JSON.parse(result.Parameter.Value);
  for (const [key, value] of Object.entries(config)) {
    if (allowedKeys.has(key) && typeof value === 'string') environment[key] = value;
  }
  for (const key of ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_PASSWORD']) {
    if (!environment[key]) throw new Error(`Application configuration is missing ${key}.`);
  }
  environment.NODE_ENV = 'production';
  environment.RUN_STARTUP_MIGRATIONS = 'false';
}

if (require.main === module) {
  const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
  const client = new SSMClient({ region: process.env.AWS_REGION, maxAttempts: 3 });
  loadConfiguration({ client, GetParameterCommand })
    .then(() => { client.destroy(); require('./backend/index.js'); })
    .catch(error => {
      console.error('[Startup] Could not load encrypted application configuration:', error.name);
      process.exitCode = 1;
    });
}

module.exports = { loadConfiguration };
