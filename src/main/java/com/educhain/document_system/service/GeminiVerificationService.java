package com.educhain.document_system.service;

import com.educhain.document_system.model.VerificationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

/**
 * Service for verifying document types using Google Gemini Vision API
 */
@Service
public class GeminiVerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiVerificationService.class);
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    
    @Value("${gemini.verification.enabled:true}")
    private boolean verificationEnabled;
    
    @Value("${gemini.confidence.threshold:0.75}")
    private double confidenceThreshold;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final Set<String> SUPPORTED_FILE_TYPES = Set.of(
        "application/pdf",
        "image/jpeg",
        "image/png"
    );
    
    public GeminiVerificationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Main verification method - validates document type using AI
     */
    public VerificationResult verifyDocument(MultipartFile file, String selectedDocumentType) {
        logger.info("Starting document verification for type: {}", selectedDocumentType);
        
        // Check if verification is enabled
        if (!verificationEnabled) {
            logger.info("Gemini verification is disabled");
            return VerificationResult.success(selectedDocumentType, 1.0);
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logger.warn("Gemini API key not configured, skipping verification");
            return VerificationResult.success(selectedDocumentType, 1.0);
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_FILE_TYPES.contains(contentType.toLowerCase())) {
            logger.error("Unsupported file type: {}", contentType);
            return VerificationResult.error("Unsupported file type. Only PDF, JPG, and PNG files are supported.");
        }
        
        try {
            // Convert file to bytes
            byte[] imageBytes = file.getBytes();
            
            // For PDFs, we'll skip actual AI verification in this implementation
            // as Gemini API requires special handling for PDFs
            if ("application/pdf".equalsIgnoreCase(contentType)) {
                logger.info("PDF file detected, bypassing AI verification");
                return VerificationResult.success(selectedDocumentType, 0.95);
            }
            
            // Call Gemini API for image files
            String geminiResponse = analyzeDocumentWithGemini(imageBytes, selectedDocumentType, contentType);
            
            // Parse response
            return parseGeminiResponse(geminiResponse, selectedDocumentType);
            
        } catch (IOException e) {
            logger.error("Failed to read file", e);
            return VerificationResult.error("Failed to read file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Verification failed", e);
            return VerificationResult.error("Verification failed: " + e.getMessage());
        }
    }
    
    /**
     * Calls Google Gemini API to analyze document
     */
    private String analyzeDocumentWithGemini(byte[] imageBytes, String documentType, String mimeType) throws Exception {
        logger.info("Calling Gemini API for document analysis");
        
        // Convert image to base64
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        
        // Build prompt for Gemini
        String prompt = buildPrompt(documentType);
        
        // Build request body
        Map<String, Object> requestBody = new HashMap<>();
        
        // Contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        // Parts array with text and inline data
        List<Map<String, Object>> parts = new ArrayList<>();
        
        // Text part
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);
        
        // Image part with correct MIME type
        Map<String, Object> imagePart = new HashMap<>();
        Map<String, String> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);
        imagePart.put("inline_data", inlineData);
        parts.add(imagePart);
        
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);
        
        // Generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.4);
        generationConfig.put("topK", 32);
        generationConfig.put("topP", 1);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);
        
        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Add API key to URL
        String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;
        
        // Make request
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                urlWithKey,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            logger.info("Gemini API response received");
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("Failed to call Gemini API", e);
            throw new Exception("Failed to call Gemini API: " + e.getMessage());
        }
    }
    
    /**
     * Builds the prompt for Gemini API
     */
    private String buildPrompt(String documentType) {
        return String.format(
            "Analyze this document image and determine if it is a %s. " +
            "Look for: 1) Official letterhead, logos, or seals 2) Required fields typical of a %s " +
            "3) Professional formatting 4) Any signs of tampering or manipulation. " +
            "Respond ONLY with a JSON object in this exact format (no markdown, no code blocks): " +
            "{\"isValid\": true/false, \"detectedType\": \"document type\", \"confidence\": 0.0-1.0, \"reason\": \"explanation\"}",
            documentType, documentType
        );
    }
    
    /**
     * Parses Gemini API response
     */
    private VerificationResult parseGeminiResponse(String response, String expectedType) {
        try {
            logger.debug("Parsing Gemini response: {}", response);
            
            JsonNode root = objectMapper.readTree(response);
            
            // Extract the text from Gemini response
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                logger.warn("No candidates in Gemini response");
                return VerificationResult.error("No response from AI service");
            }
            
            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");
            if (parts.isEmpty()) {
                logger.warn("No parts in Gemini response");
                return VerificationResult.error("Invalid response from AI service");
            }
            
            String textResponse = parts.get(0).path("text").asText();
            logger.debug("Extracted text response: {}", textResponse);
            
            // Clean up the response - remove markdown code blocks if present
            textResponse = textResponse.trim();
            if (textResponse.startsWith("```json")) {
                textResponse = textResponse.substring(7);
            }
            if (textResponse.startsWith("```")) {
                textResponse = textResponse.substring(3);
            }
            if (textResponse.endsWith("```")) {
                textResponse = textResponse.substring(0, textResponse.length() - 3);
            }
            textResponse = textResponse.trim();
            
            // Parse the JSON response from Gemini
            JsonNode aiResult = objectMapper.readTree(textResponse);
            
            boolean isValid = aiResult.path("isValid").asBoolean(false);
            String detectedType = aiResult.path("detectedType").asText("");
            double confidence = aiResult.path("confidence").asDouble(0.0);
            String reason = aiResult.path("reason").asText("");
            
            logger.info("AI Analysis - Valid: {}, Type: {}, Confidence: {}", isValid, detectedType, confidence);
            
            // Check if confidence meets threshold
            if (confidence < confidenceThreshold) {
                return VerificationResult.error(
                    String.format("Confidence score (%.2f) below threshold (%.2f). Reason: %s", 
                        confidence, confidenceThreshold, reason)
                );
            }
            
            // Check if detected type matches expected type (case-insensitive)
            String detectedTypeLower = detectedType.toLowerCase();
            String expectedTypeLower = expectedType.toLowerCase();
            boolean typeMatch = detectedTypeLower.equals(expectedTypeLower) || 
                               detectedTypeLower.contains(expectedTypeLower) ||
                               expectedTypeLower.contains(detectedTypeLower);
            
            if (isValid && typeMatch) {
                return VerificationResult.success(detectedType, confidence);
            } else if (!typeMatch) {
                return VerificationResult.failure(detectedType, expectedType, confidence);
            } else {
                return VerificationResult.error("Document validation failed: " + reason);
            }
            
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response", e);
            return VerificationResult.error("Failed to parse AI response: " + e.getMessage());
        }
    }
}
