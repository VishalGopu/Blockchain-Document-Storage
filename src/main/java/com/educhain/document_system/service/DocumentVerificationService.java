package com.educhain.document_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.io.IOException;

@Service
public class DocumentVerificationService {
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;
    
    @Value("${verification.confidence.threshold:0.80}")
    private double confidenceThreshold;
    
    /**
     * Verify document type using Google Gemini Vision API
     */
    public VerificationResult verifyDocument(MultipartFile file, String expectedDocumentType) throws IOException {
        // Convert file to base64
        byte[] fileBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(fileBytes);
        
        // Create prompt for Gemini
        String prompt = buildVerificationPrompt(expectedDocumentType);
        
        try {
            // Call Gemini API
            String response = callGeminiAPI(base64Image, prompt);
            
            // Parse response and extract verification result
            return parseVerificationResponse(response, expectedDocumentType);
            
        } catch (Exception e) {
            throw new RuntimeException("AI verification failed: " + e.getMessage());
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
    
    private String callGeminiAPI(String base64Image, String prompt) throws Exception {
        // Use REST API call to Gemini
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey;
        
        // Build request body
        String requestBody = String.format(
            "{\"contents\":[{\"parts\":[{\"text\":\"%s\"},{\"inline_data\":{\"mime_type\":\"image/jpeg\",\"data\":\"%s\"}}]}]}",
            prompt.replace("\"", "\\\"").replace("\n", "\\n"),
            base64Image
        );
        
        // Make HTTP request using RestTemplate or HttpClient
        // For simplicity, using basic implementation
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
            .uri(java.net.URI.create(apiUrl))
            .header("Content-Type", "application/json")
            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
            
        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error: " + response.body());
        }
        
        return response.body();
    }
    
    private VerificationResult parseVerificationResponse(String apiResponse, String expectedType) {
        try {
            // Parse JSON response from Gemini
            // Extract the text content from the response
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(apiResponse);
            
            String textContent = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Parse the JSON within the text
            com.fasterxml.jackson.databind.JsonNode verification = mapper.readTree(textContent);
            
            VerificationResult result = new VerificationResult();
            result.setDetectedType(verification.path("documentType").asText());
            result.setValid(verification.path("isValid").asBoolean());
            result.setConfidence(verification.path("confidence").asDouble());
            result.setReason(verification.path("reason").asText());
            result.setExpectedType(expectedType);
            result.setMatches(result.getDetectedType().equalsIgnoreCase(expectedType) && result.getConfidence() >= confidenceThreshold);
            
            return result;
            
        } catch (Exception e) {
            // Fallback if parsing fails
            VerificationResult result = new VerificationResult();
            result.setValid(false);
            result.setReason("Failed to parse AI response: " + e.getMessage());
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
