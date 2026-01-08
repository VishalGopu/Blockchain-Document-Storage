package com.educhain.document_system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test to verify that application.properties can be loaded successfully
 * and cookie configuration properties are parsed correctly.
 * This test validates that the properties file syntax is valid.
 */
class PropertiesLoadingTest {

    private Properties loadApplicationProperties() throws IOException {
        Properties properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            assertNotNull(input, "application.properties should exist");
            properties.load(input);
        }
        return properties;
    }

    @Test
    void testApplicationPropertiesCanBeLoaded() throws IOException {
        Properties properties = loadApplicationProperties();

        // Verify that cookie properties exist and have correct values
        assertEquals("none", properties.getProperty("server.servlet.session.cookie.same-site"), 
            "SameSite property should be 'none'");
        assertEquals("true", properties.getProperty("server.servlet.session.cookie.secure"), 
            "Secure property should be 'true'");
        assertEquals("true", properties.getProperty("server.servlet.session.cookie.http-only"), 
            "HttpOnly property should be 'true'");
        assertEquals("30m", properties.getProperty("server.servlet.session.timeout"), 
            "Timeout should be '30m'");
    }

    @Test
    void testNoInlineCommentsInCookieProperties() throws IOException {
        Properties properties = loadApplicationProperties();

        // Verify that property values do NOT contain inline comments
        String secureValue = properties.getProperty("server.servlet.session.cookie.secure");
        assertNotNull(secureValue, "Secure property should exist");
        assertFalse(secureValue.contains("#"), 
            "Secure property should not contain inline comment");
        
        String httpOnlyValue = properties.getProperty("server.servlet.session.cookie.http-only");
        assertNotNull(httpOnlyValue, "HttpOnly property should exist");
        assertFalse(httpOnlyValue.contains("#"), 
            "HttpOnly property should not contain inline comment");
    }
}
