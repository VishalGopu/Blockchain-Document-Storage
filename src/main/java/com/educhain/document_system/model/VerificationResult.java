package com.educhain.document_system.model;

/**
 * DTO for document verification results from Gemini AI
 */
public class VerificationResult {
    
    private boolean verified;
    private String detectedType;
    private double confidenceScore;
    private String message;
    private boolean typeMismatch;
    
    // Constructors
    public VerificationResult() {
    }
    
    public VerificationResult(boolean verified, String detectedType, double confidenceScore, String message, boolean typeMismatch) {
        this.verified = verified;
        this.detectedType = detectedType;
        this.confidenceScore = confidenceScore;
        this.message = message;
        this.typeMismatch = typeMismatch;
    }
    
    // Static factory methods for common scenarios
    public static VerificationResult success(String detectedType, double confidence) {
        return new VerificationResult(true, detectedType, confidence, 
            "Document verified successfully", false);
    }
    
    public static VerificationResult failure(String detectedType, String expectedType, double confidence) {
        return new VerificationResult(false, detectedType, confidence,
            String.format("Document type mismatch. Expected: %s, Detected: %s", expectedType, detectedType), 
            true);
    }
    
    public static VerificationResult error(String message) {
        return new VerificationResult(false, null, 0.0, message, false);
    }
    
    // Getters and Setters
    public boolean isVerified() {
        return verified;
    }
    
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
    
    public String getDetectedType() {
        return detectedType;
    }
    
    public void setDetectedType(String detectedType) {
        this.detectedType = detectedType;
    }
    
    public double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isTypeMismatch() {
        return typeMismatch;
    }
    
    public void setTypeMismatch(boolean typeMismatch) {
        this.typeMismatch = typeMismatch;
    }
}
