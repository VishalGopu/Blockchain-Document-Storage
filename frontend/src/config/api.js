// API configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Replace this with your actual Railway backend URL after deployment
    return process.env.REACT_APP_API_URL || 'https://your-railway-app.railway.app/api';
  }
  
  // Development environment
  return 'http://localhost:8080/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
};

// For debugging
console.log('API Base URL:', API_CONFIG.BASE_URL);