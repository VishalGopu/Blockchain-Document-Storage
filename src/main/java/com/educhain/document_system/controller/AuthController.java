package com.educhain.document_system.controller;


import com.educhain.document_system.model.User;
import com.educhain.document_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // User login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.loginUser(username, password);
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("userRole", user.getRole().toString());
            
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("role", user.getRole().toString());
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // User registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String role) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            User newUser = userService.registerUser(username, password, userRole);
            
            response.put("success", true);
            response.put("message", "Registration successful!");
            response.put("userId", newUser.getId());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // User logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            session.invalidate();
            response.put("success", true);
            response.put("message", "Logout successful!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Logout failed!");
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Check if user is logged in
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        User user = (User) session.getAttribute("user");
        
        if (user != null) {
            response.put("loggedIn", true);
            response.put("role", user.getRole().toString());
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
        } else {
            response.put("loggedIn", false);
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Get current user info
    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        User user = (User) session.getAttribute("user");
        
        if (user != null) {
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole().toString(),
                "walletAddress", user.getWalletAddress() != null ? user.getWalletAddress() : ""
            ));
        } else {
            response.put("success", false);
            response.put("message", "Not logged in");
        }
        
        return ResponseEntity.ok(response);
    }
}