# Google Gemini AI Setup Guide

## Getting Your API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Configuration

### Local Development
Add to `src/main/resources/application.properties`:
```
gemini.api.key=YOUR_API_KEY_HERE
```

### Production (DigitalOcean/Railway)
Add environment variable:
```
GEMINI_API_KEY=your_actual_api_key
```

## Testing

1. Upload a document
2. Select document type (e.g., "Transcript")
3. Click "Verify Document with AI"
4. Review verification result
5. If verified, upload to blockchain

## Supported Document Types

- Transcript
- Certificate
- ID Card
- Diploma
- General

## Troubleshooting

- **API Key Invalid**: Check your Gemini API key is correct
- **Verification Fails**: Document may be poor quality or wrong type
- **Timeout**: Large files may take longer to process

## How It Works

The system uses Google's Gemini 1.5 Flash model to analyze document images and verify their types:

1. Document is converted to base64 format
2. Sent to Gemini API with verification prompt
3. Gemini analyzes the document for key indicators
4. Returns confidence score and detected document type
5. System compares detected type with expected type
6. Upload is only allowed if verification passes

## Security Notes

- Never commit API keys to the repository
- Use environment variables for production
- API calls are made only by authenticated admin users
- Verification is required before blockchain upload
