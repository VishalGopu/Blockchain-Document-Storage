package com.educhain. document_system.service;

import com.educhain.document_system. model.VerificationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util. Base64;
import java.util. Arrays;
import java.util.List;

@Service
public class GeminiVerificationService {

    @Value("${gemini. api. key: }")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    @Value("${gemini.verification.enabled:true}")
    private boolean verificationEnabled;

    @Value("${gemini.confidence.threshold:0.75}")
    private double confidenceThreshold;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> SUPPORTED_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    /**
     * Verify document type using Google Gemini Vision API
     */
    public VerificationResult verifyDocument(MultipartFile file, String selectedDocumentType) {
        try {
            // Check if verification is enabled
            if (!verificationEnabled) {
                return new VerificationResult(true, selectedDocumentType, 1.0, 
                    "Verification disabled - document accepted");
            }

            // Check if API key is configured
            if (geminiApiKey == null || geminiApiKey. trim().isEmpty()) {
                System.err.println("Gemini API key not configured - skipping verification");
                return new VerificationResult(true, selectedDocumentType, 1.0, 
                    "API key not configured - document accepted without verification");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !SUPPORTED_TYPES.contains(contentType. toLowerCase())) {
                return new VerificationResult(false, "Unknown", 0.0, 
                    "Unsupported file type.  Please upload an image (JPG, PNG, GIF, WEBP).");
            }

            // Validate file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return new VerificationResult(false, "Unknown", 0.0, 
                    "File too large. Maximum size is 10MB.");
            }

            // Convert to Base64
            byte[] fileBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(fileBytes);

            // Call Gemini API
            String geminiResponse = callGeminiAPI(base64Image, selectedDocumentType, contentType);

            // Parse response
            return parseGeminiResponse(geminiResponse, selectedDocumentType);

        } catch (Exception e) {
            System.err.println("Verification error: " + e.getMessage());
            e.printStackTrace();
            // In case of error, allow upload but log the issue
            return new VerificationResult(true, selectedDocumentType, 0.5, 
                "Verification service unavailable - document accepted with warning");
        }
    }

    /**
     * Call Google Gemini Vision API
     */
    private String callGeminiAPI(String base64Image, String documentType, String mimeType) throws Exception {
        String prompt = buildPrompt(documentType);
        
        String requestBody = String.format(
            "{\"contents\":[{\"parts\":[{\"text\":\"%s\"},{\"inline_data\":{\"mime_type\":\"%s\",\"data\":\"%s\"}}]}]}",
            prompt. replace("\"", "\\\"").replace("\n", "\\n"),
            mimeType,
            base64Image
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(geminiApiUrl + "?key=" + geminiApiKey))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error: " + response.body());
        }

        return response.body();
    }

    /**
     * Build verification prompt for Gemini
     */
    private String buildPrompt(String documentType) {
        return String.format(
            "You are a document verification AI.  Analyze this document image and determine if it is a valid %s.\n\n" +
            "Look for these indicators:\n" +
            "- For TRANSCRIPT: grades, course names, GPA, student name, institution name, academic terms\n" +
            "- For CERTIFICATE: official seals, signatures, certification authority, date of issuance\n" +
            "- For DIPLOMA: degree title, institution name, graduation date, official seals, signatures\n" +
            "- For ID CARD: photo, ID number, institution logo, expiration date, name\n" +
            "- For ADMISSION LETTER: institution letterhead, admission offer, student name, program details\n\n" +
            "Respond ONLY with this JSON format (no extra text):\n" +
            "{\n" +
            "  \"documentType\": \"<detected type:  Transcript/Certificate/Diploma/ID Card/Other>\",\n" +
            "  \"isValid\": <true/false>,\n" +
            "  \"confidence\":  <0.0-1.0>,\n" +
            "  \"reason\": \"<brief explanation>\"\n" +
            "}",
            documentType
        );
    }

    /**
     * Parse Gemini API response
     */
    private VerificationResult parseGeminiResponse(String apiResponse, String expectedType) {
        try {
            JsonNode root = objectMapper.readTree(apiResponse);
            
            // Extract text from Gemini response structure
            String textContent = root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();

            // Clean up response (remove markdown code blocks if present)
            textContent = textContent.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();

            // Parse the JSON content
            JsonNode verificationData = objectMapper.readTree(textContent);

            String detectedType = verificationData. path("documentType").asText("Unknown");
            boolean isValid = verificationData.path("isValid").asBoolean(false);
            double confidence = verificationData.path("confidence").asDouble(0.0);
            String reason = verificationData.path("reason").asText("No reason provided");

            // Check if types match
            boolean typesMatch = detectedType.equalsIgnoreCase(expectedType) || 
                                 detectedType.toLowerCase().contains(expectedType.toLowerCase()) ||
                                 expectedType. toLowerCase().contains(detectedType. toLowerCase());

            if (isValid && typesMatch && confidence >= confidenceThreshold) {
                return new VerificationResult(
                    true, 
                    detectedType, 
                    confidence, 
                    String.format("✅ Document verified as %s with %. 0f%% confidence", detectedType, confidence * 100)
                );
            } else if (!typesMatch) {
                VerificationResult result = new VerificationResult(
                    false,
                    detectedType,
                    confidence,
                    String.format("❌ Document type mismatch!  You selected '%s' but the document appears to be a '%s'.  %s", 
                        expectedType, detectedType, reason)
                );
                result.setTypeMismatch(true);
                return result;
            } else if (confidence < confidenceThreshold) {
                return new VerificationResult(
                    false,
                    detectedType,
                    confidence,
                    String.format("⚠️ Low confidence (%.0f%%). %s Please upload a clearer image.", confidence * 100, reason)
                );
            } else {
                return new VerificationResult(
                    false,
                    detectedType,
                    confidence,
                    String.format("❌ Document validation failed: %s", reason)
                );
            }

        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            e.printStackTrace();
            // On parse error, allow upload but warn
            return new VerificationResult(true, expectedType, 0.5, 
                "Could not parse verification result - document accepted with warning");
        }
    }
}
