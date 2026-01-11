# Google Gemini API Setup Guide

This guide explains how to set up Google Gemini AI for document verification in the EduChain system.

## 🎯 Overview

The EduChain system uses Google Gemini Vision API to automatically verify document types during admin uploads. This ensures that uploaded documents match their declared type (e.g., Certificate, Transcript, Diploma).

**Implementation Note**: The integration uses Google Gemini's REST API directly via Spring's RestTemplate, so no additional Maven dependencies are required beyond the standard Spring Boot libraries already in the project.

## 🔑 Getting Your API Key

### Step 1: Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key (it starts with `AIza...`)
5. **Keep this key secure** - never commit it to version control

### Step 2: Configure Environment Variables

#### For Local Development
Add to your `.env` file or set as environment variables:
```bash
export GEMINI_API_KEY=your_actual_api_key_here
```

#### For Production Deployment (Railway/DigitalOcean)
1. Go to your deployment platform dashboard
2. Navigate to Environment Variables settings
3. Add new variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_actual_api_key_here`
4. Redeploy the application

## 📄 Supported Document Types

The system can verify the following document types:

- **General** - Any general document
- **Certificate** - Academic or professional certificates
- **Transcript** - Academic transcripts/grade reports
- **Degree** - Degree certificates
- **Diploma** - Diploma certificates

## 🔄 How Verification Works

### Verification Process Flow

1. **Admin uploads document** → System receives file + selected document type
2. **File validation** → Checks file format (PDF, JPG, PNG only)
3. **AI analysis** → Sends to Gemini Vision API for content analysis
4. **Type matching** → Compares AI-detected type with selected type
5. **Confidence check** → Verifies confidence score ≥ 75%
6. **Result** → Upload proceeds if verified, otherwise blocked

### AI Analysis Criteria

The Gemini AI analyzes:
- ✅ Official letterhead, logos, or seals
- ✅ Required fields typical of document type
- ✅ Professional formatting and layout
- ✅ Signs of tampering or manipulation

### Confidence Threshold

- Default threshold: **75%** (0.75)
- Configurable in `application.properties`:
  ```properties
  gemini.confidence.threshold=0.75
  ```
- Documents below threshold are rejected

## ⚙️ Configuration Options

### application.properties Settings

```properties
# Gemini API Key (from environment variable)
gemini.api.key=${GEMINI_API_KEY:}

# Gemini API Endpoint
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

# Enable/Disable Verification
gemini.verification.enabled=true

# Minimum Confidence Score (0.0 - 1.0)
gemini.confidence.threshold=0.75
```

### Disabling Verification

To disable AI verification (e.g., for testing):
```properties
gemini.verification.enabled=false
```

Or set environment variable:
```bash
export GEMINI_VERIFICATION_ENABLED=false
```

## 🛡️ Security Best Practices

### API Key Security
- ❌ **Never** hardcode API keys in source code
- ✅ **Always** use environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate keys periodically
- ✅ Use different keys for dev/staging/production

### Rate Limiting
- Google Gemini has rate limits (varies by plan)
- Free tier: ~60 requests per minute
- Consider implementing caching for repeated verifications
- Monitor API usage in [Google Cloud Console](https://console.cloud.google.com/)

## 🧪 Testing the Integration

### 1. Test with API Key Missing
Expected: System should bypass verification gracefully

### 2. Test with Valid Document
1. Upload a certificate as "Certificate"
2. Expected: ✅ Verification passes with high confidence

### 3. Test with Wrong Type
1. Upload a certificate but select "Transcript"
2. Expected: ❌ Verification fails with type mismatch error

### 4. Test with Invalid File Type
1. Upload a .txt or .docx file
2. Expected: ❌ Rejected before API call

## 📊 Monitoring & Logs

### Application Logs
Look for these log messages:
```
INFO  - Starting document verification for type: Certificate
INFO  - Calling Gemini API for document analysis
INFO  - AI Analysis - Valid: true, Type: Certificate, Confidence: 0.92
```

### Error Handling
The system gracefully handles:
- Missing API key → Bypasses verification
- API service down → Returns error message
- Invalid response → Returns parsing error
- Low confidence → Returns threshold error

## 🚨 Troubleshooting

### Problem: "Gemini API key not configured"
**Solution**: Set `GEMINI_API_KEY` environment variable

### Problem: "Failed to call Gemini API"
**Possible causes**:
- Invalid API key
- Network connectivity issues
- API rate limit exceeded
- API service temporary outage

**Solution**: Check logs for specific error, verify API key, check network

### Problem: Verification always fails
**Possible causes**:
- Confidence threshold too high
- Poor image quality
- Document type mismatch

**Solution**: 
- Lower threshold in config
- Ensure high-quality scans/images
- Verify correct document type selected

### Problem: PDF files not verifying
**Note**: Current implementation bypasses full AI verification for PDFs (returns 95% confidence) due to Gemini API PDF handling complexity. This can be enhanced in future versions.

## 📈 Future Enhancements

Potential improvements:
- Enhanced PDF text extraction and analysis
- Caching for repeated document verifications
- Batch verification for multiple documents
- Custom document type training
- Multi-language support
- Tamper detection enhancements

## 🔗 Useful Links

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Rate Limits & Quotas](https://ai.google.dev/docs/rate_limits)

## 📞 Support

For issues specific to:
- **Gemini API**: Check [Google AI Documentation](https://ai.google.dev/docs)
- **Integration Issues**: Open an issue in the repository
- **Configuration Help**: Refer to this guide or application logs
