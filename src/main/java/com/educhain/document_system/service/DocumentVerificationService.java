package com.educhain.document_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.security.MessageDigest;
import java.util.Base64;
import java.io.IOException;

@Service
public class DocumentVerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentVerificationService.class);
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;
    
    @Value("${verification.confidence.threshold:0.80}")
    private double confidenceThreshold;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"};
    
    /**
     * Verify document type using Google Gemini Vision API
     */
    public VerificationResult verifyDocument(MultipartFile file, String expectedDocumentType) throws IOException {
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        boolean validType = false;
        if (contentType != null) {
            for (String allowedType : ALLOWED_MIME_TYPES) {
                if (contentType.startsWith(allowedType)) {
                    validType = true;
                    break;
                }
            }
        }
        if (!validType) {
            throw new IllegalArgumentException("Invalid file type. Only images and PDFs are allowed.");
        }
        
        // Convert file to base64
        byte[] fileBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(fileBytes);
        
        // Create prompt for Gemini
        String prompt = buildVerificationPrompt(expectedDocumentType);
        
        try {
            // Call Gemini API
            String response = callGeminiAPI(base64Image, prompt, contentType);
            
            // Parse response and extract verification result
            return parseVerificationResponse(response, expectedDocumentType);
            
        } catch (Exception e) {
            // Log the full error but return sanitized message
            logger.error("AI verification failed", e);
            throw new RuntimeException("AI verification service temporarily unavailable. Please try again later.");
        }
    }
    
    private String buildVerificationPrompt(String expectedType) {
        return String.format(
            "Analyze this document image and determine if it is a %s. " +
            "Look for key indicators such as:\n" +
            "- For Transcripts: grades, courses, GPA, student name, institution name\n" +
            "- For Certificates: official seals, signatures, dates, awarding body\n" +
            "- For ID Cards: photo, ID number, institution logo, expiration date\n" +
            "- For Diplomas: degree title, institution name, graduation date, signatures\n\n" +
            "Respond in JSON format:\n" +
            "{\n" +
            "  \"documentType\": \"detected type\",\n" +
            "  \"isValid\": true/false,\n" +
            "  \"confidence\": 0.0-1.0,\n" +
            "  \"reason\": \"explanation\",\n" +
            "  \"detectedElements\": [\"list of found elements\"]\n" +
            "}",
            expectedType
        );
    }
    
    private String callGeminiAPI(String base64Image, String prompt, String mimeType) throws Exception {
        // Use REST API call to Gemini
        // Note: Gemini API requires the key as a query parameter per their API specification
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey;
        
        // Build request body using Jackson to prevent JSON injection
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode rootNode = mapper.createObjectNode();
        ArrayNode contentsArray = mapper.createArrayNode();
        ObjectNode contentNode = mapper.createObjectNode();
        ArrayNode partsArray = mapper.createArrayNode();
        
        // Add text part
        ObjectNode textPart = mapper.createObjectNode();
        textPart.put("text", prompt);
        partsArray.add(textPart);
        
        // Add image part
        ObjectNode imagePart = mapper.createObjectNode();
        ObjectNode inlineData = mapper.createObjectNode();
        inlineData.put("mime_type", mimeType != null ? mimeType : "image/jpeg");
        inlineData.put("data", base64Image);
        imagePart.set("inline_data", inlineData);
        partsArray.add(imagePart);
        
        contentNode.set("parts", partsArray);
        contentsArray.add(contentNode);
        rootNode.set("contents", contentsArray);
        
        String requestBody = mapper.writeValueAsString(rootNode);
        
        // Make HTTP request
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
            .uri(java.net.URI.create(apiUrl))
            .header("Content-Type", "application/json")
            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
            
        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            // Log the error but don't expose details to user
            logger.error("Gemini API error (status {}): {}", response.statusCode(), response.body());
            throw new RuntimeException("AI service returned an error. Please try again.");
        }
        
        return response.body();
    }
    
    private VerificationResult parseVerificationResponse(String apiResponse, String expectedType) {
        try {
            // Parse JSON response from Gemini
            // Extract the text content from the response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(apiResponse);
            
            // Add null/bounds checking for API response
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || candidates.size() == 0) {
                throw new IllegalStateException("No candidates in API response");
            }
            
            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");
            if (parts.isMissingNode() || parts.size() == 0) {
                throw new IllegalStateException("No parts in API response");
            }
            
            String textContent = parts.get(0).path("text").asText();
            if (textContent == null || textContent.isEmpty()) {
                throw new IllegalStateException("Empty text content in API response");
            }
            
            // Parse the JSON within the text
            JsonNode verification = mapper.readTree(textContent);
            
            VerificationResult result = new VerificationResult();
            String detectedType = verification.path("documentType").asText();
            result.setDetectedType(detectedType != null ? detectedType : "Unknown");
            result.setValid(verification.path("isValid").asBoolean());
            result.setConfidence(verification.path("confidence").asDouble());
            result.setReason(verification.path("reason").asText());
            result.setExpectedType(expectedType);
            
            // Add null check before equalsIgnoreCase
            boolean typeMatches = detectedType != null && 
                                  detectedType.equalsIgnoreCase(expectedType) && 
                                  result.getConfidence() >= confidenceThreshold;
            result.setMatches(typeMatches);
            
            return result;
            
        } catch (Exception e) {
            // Fallback if parsing fails - log the error but return sanitized message
            logger.error("Failed to parse AI response", e);
            VerificationResult result = new VerificationResult();
            result.setValid(false);
            result.setReason("Unable to verify document. The AI response could not be processed.");
            return result;
        }
    }
    
    // Inner class for verification result
    public static class VerificationResult {
        private String detectedType;
        private String expectedType;
        private boolean isValid;
        private boolean matches;
        private double confidence;
        private String reason;
        
        // Getters and setters
        public String getDetectedType() { return detectedType; }
        public void setDetectedType(String detectedType) { this.detectedType = detectedType; }
        
        public String getExpectedType() { return expectedType; }
        public void setExpectedType(String expectedType) { this.expectedType = expectedType; }
        
        public boolean isValid() { return isValid; }
        public void setValid(boolean valid) { isValid = valid; }
        
        public boolean isMatches() { return matches; }
        public void setMatches(boolean matches) { this.matches = matches; }
        
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
