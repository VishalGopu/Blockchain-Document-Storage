# Google reCAPTCHA Integration

This document outlines the Google reCAPTCHA implementation in the EduChain frontend application.

## Overview

We've integrated Google reCAPTCHA v2 to protect the login and registration forms from automated bot attacks. The implementation supports both text-based and image-based challenges.

## Features

### ✅ Implemented Features

- **Login Form Protection**: Text-based reCAPTCHA challenges
- **Registration Form Protection**: Image-based reCAPTCHA preference
- **Enhanced Security**: Automatic challenge type selection by Google's algorithms
- **User Experience**: Clear status messages and validation
- **Error Handling**: Proper error states and recovery
- **Responsive Design**: Works on desktop and mobile devices

### 📁 File Structure

```
src/
├── components/
│   └── EnhancedReCaptcha.js     # Enhanced reCAPTCHA component
├── config/
│   └── recaptcha.js             # reCAPTCHA configuration
└── App.js                       # Main app with integrated forms
```

## Implementation Details

### 1. Enhanced reCAPTCHA Component (`src/components/EnhancedReCaptcha.js`)

A wrapper component around `react-google-recaptcha` that provides:

- **Status Messages**: Visual feedback for verification state
- **Error Handling**: Automatic error detection and display
- **Theme Support**: Light/dark theme options
- **Size Options**: Normal/compact sizing
- **Challenge Type Hints**: Preference for text vs image challenges

### 2. Configuration (`src/config/recaptcha.js`)

Centralized configuration for:

- Site keys (currently using Google test keys)
- Theme and size preferences
- Challenge type definitions

### 3. Form Integration

#### Login Form
- Uses text-based reCAPTCHA preference
- Resets reCAPTCHA on failed login attempts
- Prevents submission without verification

#### Registration Form
- Uses image-based reCAPTCHA preference
- Resets reCAPTCHA after each submission attempt
- Enhanced security for new account creation

## Setup Instructions

### 1. Development (Current State)

The application is currently configured with Google's test keys that work on `localhost`. No additional setup required for development.

### 2. Production Setup

1. **Get reCAPTCHA Keys**:
   - Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
   - Choose "reCAPTCHA v2"
   - Select "I'm not a robot" Checkbox
   - Add your domain(s)
   - Copy the site key and secret key

2. **Update Frontend Configuration**:
   ```javascript
   // In src/config/recaptcha.js
   export const RECAPTCHA_CONFIG = {
     SITE_KEY_V2: 'your-actual-site-key-here',
     // ... other config
   };
   ```

3. **Backend Integration** (Required):
   - Configure your backend to verify reCAPTCHA tokens
   - Use the secret key to validate tokens server-side
   - Reject requests with invalid/missing reCAPTCHA verification

## Challenge Types

### Text-Based Challenges
- Simple "I'm not a robot" checkbox
- Used for login form
- Lower friction for returning users

### Image-Based Challenges
- "Select all images with traffic lights" style challenges
- Used for registration form (preference)
- Enhanced security for new accounts

**Note**: Google's algorithms ultimately determine the actual challenge type based on risk assessment, user behavior, and other factors. The `challengeType` prop serves as a preference/hint.

## API Integration

### Current Implementation

The forms are prepared to send reCAPTCHA tokens to the backend. Update your API calls to include the reCAPTCHA token:

```javascript
// Example API call modification
const login = async (username, password, recaptchaToken) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('recaptchaToken', recaptchaToken); // Add this line
  
  return api.request('/auth/login', { 
    method: 'POST', 
    body: formData 
  });
};
```

### Backend Verification

Your backend should verify the reCAPTCHA token:

```javascript
// Example backend verification (Node.js)
const verifyRecaptcha = async (token) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=YOUR_SECRET_KEY&response=${token}`
  });
  
  const data = await response.json();
  return data.success;
};
```

## Testing

### Test Keys (Development)
- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These keys always return successful verification and should only be used for testing.

### Manual Testing

1. **Login Form**:
   - Enter credentials
   - Complete reCAPTCHA
   - Verify form submission is enabled/disabled based on reCAPTCHA state

2. **Registration Form**:
   - Enter registration details
   - Complete reCAPTCHA (may show image challenges)
   - Verify form behavior with valid/invalid reCAPTCHA

3. **Error States**:
   - Let reCAPTCHA expire
   - Test network failure scenarios
   - Verify error messages display correctly

## Security Considerations

1. **Always verify server-side**: Never trust client-side reCAPTCHA alone
2. **Rate limiting**: Implement additional rate limiting on your backend
3. **Log suspicious activity**: Monitor failed reCAPTCHA attempts
4. **Keep keys secure**: Never commit real keys to version control

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **reCAPTCHA not loading**: Check network connection and site key
2. **Infinite loading**: Verify domain configuration in reCAPTCHA admin
3. **Verification always fails**: Check secret key on backend
4. **Mobile issues**: Ensure responsive design and proper viewport meta tag

### Debug Mode

Enable debug mode by adding to your browser console:

```javascript
window.grecaptcha.enterprise.debug = true;
```

## Dependencies

- `react-google-recaptcha`: ^3.1.0
- React 16.8+ (for hooks support)

## Future Enhancements

- [ ] reCAPTCHA v3 integration (score-based)
- [ ] Invisible reCAPTCHA option
- [ ] Analytics integration
- [ ] A/B testing for challenge types
- [ ] Accessibility improvements

---

For questions or issues, please refer to the [Google reCAPTCHA documentation](https://developers.google.com/recaptcha) or open an issue in this repository.