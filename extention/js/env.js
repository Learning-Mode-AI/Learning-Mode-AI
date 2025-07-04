function getBaseUrl() {
  const env = localStorage.getItem('ENVIRONMENT');

  switch (env) {
    case 'production':
      return 'https://api.learningmodeai.com';
    case 'staging':
      return 'https://staging.learningmodeai.com';
    case 'test':
    default:
      return 'http://localhost:8080';
  }
}

export const BASE_URL = getBaseUrl();