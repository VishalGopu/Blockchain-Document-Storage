# 🔐 reCAPTCHA Secret Key Placement Guide

## ⚠️ **CRITICAL SECURITY RULE**

**NEVER place the reCAPTCHA secret key in your frontend code!**

The secret key must **ONLY** be stored on your backend server where users cannot see it.

---

## 📍 **Where to Place Each Key**

### 🌐 **SITE KEY** (Frontend - Safe to be Public)
**✅ Location**: `frontend/src/config/recaptcha.js`

```javascript
export const RECAPTCHA_CONFIG = {
  SITE_KEY_V2: 'your-site-key-here',  // ✅ Safe in frontend
  // ... other config
};
```

### 🔒 **SECRET KEY** (Backend ONLY - Must be Private)

#### **Option 1: Environment Variables (Recommended)**
```bash
# Create .env file in your backend project root
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

#### **Option 2: Application Properties (Current Setup)**
**✅ Already configured**: `src/main/resources/application.properties`

```properties
# reCAPTCHA Configuration
recaptcha.secret.key=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe  # Test key
recaptcha.verify.url=https://www.google.com/recaptcha/api/siteverify
```

---

## 🛠️ **Current Implementation Status**

### ✅ **What's Been Set Up**

1. **Frontend Integration**: 
   - reCAPTCHA components added to login/register forms
   - Site key configured in `frontend/src/config/recaptcha.js`
   - Forms send reCAPTCHA tokens to backend

2. **Backend Integration**:
   - `RecaptchaService.java` created for token verification
   - `AuthController.java` updated to require reCAPTCHA verification
   - Secret key configured in `application.properties`

3. **Full Security Chain**:
   - Frontend collects reCAPTCHA token
   - Backend verifies token with Google
   - Invalid tokens are rejected

---

## 🔑 **How to Get Your Keys**

### **Step 1: Visit Google reCAPTCHA Admin**
Go to: https://www.google.com/recaptcha/admin/create

### **Step 2: Configure Your Site**
- Choose **reCAPTCHA v2**
- Select **"I'm not a robot" Checkbox**
- Add domains:
  - `localhost` (for development)
  - `yourdomain.com` (for production)

### **Step 3: Get Your Keys**
Google will provide:
- **Site Key**: Goes in frontend (`recaptcha.js`)
- **Secret Key**: Goes in backend (`application.properties`)

---

## 🔄 **How It Works**

```
1. User visits login/register form
2. Frontend displays reCAPTCHA widget (using SITE KEY)
3. User completes reCAPTCHA challenge
4. Frontend gets token from Google
5. Frontend sends token to your backend
6. Backend verifies token with Google (using SECRET KEY)
7. Backend accepts/rejects request based on verification
```

---

## 📝 **For Production**

### **Update Frontend**
Replace test site key in `frontend/src/config/recaptcha.js`:
```javascript
export const RECAPTCHA_CONFIG = {
  SITE_KEY_V2: 'your-real-site-key-here',  // Replace this
  // ...
};
```

### **Update Backend**
Replace test secret key in `src/main/resources/application.properties`:
```properties
# Replace with your real secret key
recaptcha.secret.key=your-real-secret-key-here
```

---

## 🔍 **Security Best Practices**

1. **✅ DO**:
   - Store secret key on backend only
   - Use environment variables in production
   - Verify all reCAPTCHA tokens server-side
   - Log failed verification attempts

2. **❌ DON'T**:
   - Put secret key in frontend code
   - Commit real keys to version control
   - Trust client-side verification alone
   - Skip IP address validation

---

## 🧪 **Current Test Configuration**

**Frontend (Site Key)**: `6LfCdjksAAAAAPSlEM1IiMojuWkL22p3FYD7WCNp`  
**Backend (Secret Key)**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These test keys work on `localhost` and always return successful verification. Replace with real keys for production.

---

## ✅ **Verification Checklist**

- [x] Site key in frontend config
- [x] Secret key in backend config  
- [x] reCAPTCHA service implemented
- [x] Controllers updated to verify tokens
- [x] Frontend sends tokens to backend
- [x] Error handling for failed verification
- [x] Test keys working on localhost

**Next**: Replace test keys with production keys when deploying!

---

## 🆘 **Need Help?**

- **Google Docs**: https://developers.google.com/recaptcha
- **Test Keys**: Always work on localhost for development
- **Verification**: Check browser network tab to see token flow
- **Debug**: Enable reCAPTCHA debug mode in browser console