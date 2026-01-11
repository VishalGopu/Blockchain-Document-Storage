
package com.educhain.document_system.model;

public class VerificationResult {
    private boolean verified;
    private String detectedType;
    private double confidenceScore;
    private String message;
    private boolean typeMismatch;

    public VerificationResult() {
    }

    public VerificationResult(boolean verified, String detectedType, double confidenceScore, String message) {
        this.verified = verified;
        this.detectedType = detectedType;
        this.confidenceScore = confidenceScore;
        this.message = message;
        this.typeMismatch = false;
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
