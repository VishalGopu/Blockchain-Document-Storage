package com.educhain.document_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret.key}")
    private String secretKey;

    @Value("${recaptcha.verify.url}")
    private String verifyUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Verify reCAPTCHA token with Google
     * 
     * @param recaptchaToken The token received from frontend
     * @param userIp The user's IP address (optional)
     * @return true if verification successful, false otherwise
     */
    public boolean verifyRecaptcha(String recaptchaToken, String userIp) {
        if (recaptchaToken == null || recaptchaToken.trim().isEmpty()) {
            return false;
        }

        try {
            // Prepare request body
            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("secret", secretKey);
            requestBody.add("response", recaptchaToken);
            if (userIp != null && !userIp.isEmpty()) {
                requestBody.add("remoteip", userIp);
            }

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            // Make request to Google
            ResponseEntity<String> response = restTemplate.postForEntity(verifyUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                return jsonResponse.get("success").asBoolean();
            }

            return false;

        } catch (Exception e) {
            // Log the error in production
            System.err.println("reCAPTCHA verification error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get detailed verification result
     * 
     * @param recaptchaToken The token received from frontend
     * @param userIp The user's IP address (optional)
     * @return Map containing verification details
     */
    public Map<String, Object> getVerificationDetails(String recaptchaToken, String userIp) {
        try {
            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("secret", secretKey);
            requestBody.add("response", recaptchaToken);
            if (userIp != null && !userIp.isEmpty()) {
                requestBody.add("remoteip", userIp);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(verifyUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return objectMapper.readValue(response.getBody(), Map.class);
            }

            return Map.of("success", false, "error", "HTTP error");

        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}