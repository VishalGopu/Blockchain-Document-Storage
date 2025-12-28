// Google reCAPTCHA configuration
// Replace these with your actual reCAPTCHA site keys from Google reCAPTCHA admin console

export const RECAPTCHA_CONFIG = {
  // Your actual reCAPTCHA site key
  SITE_KEY_V2: '6LfCdjksAAAAAPSlEM1IiMojuWkL22p3FYD7WCNp',
  
  // For production, replace with your actual keys:
  // SITE_KEY_V2: 'your-actual-site-key-here',
  
  // reCAPTCHA v2 options
  THEME: 'light', // 'light' or 'dark'
  SIZE: 'normal', // 'normal' or 'compact'
  
  // Challenge types
  CHALLENGE_TYPES: {
    TEXT: 'text', // Text-based challenges (default)
    IMAGE: 'image' // Image-based challenges
  }
};

// Instructions for setup:
/*
1. Go to https://www.google.com/recaptcha/admin/create
2. Choose reCAPTCHA v2 
3. Select "I'm not a robot" Checkbox
4. Add your domain (localhost for development)
5. Accept reCAPTCHA Terms of Service
6. Copy your site key and secret key
7. Replace SITE_KEY_V2 above with your actual site key
8. Configure your backend to verify reCAPTCHA tokens with your secret key
*/