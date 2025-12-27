package com.educhain.document_system.service;


import com.educhain.document_system.model.User;
import com.educhain.document_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Register new user
    public User registerUser(String username, String password, User.Role role) {
        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists!");
        }
        
        // Create new user
        User user = new User(username, password, role);
        return userRepository.save(user);
    }
    
    // Login user
    public User loginUser(String username, String password) {
        Optional<User> user = userRepository.findByUsernameAndPassword(username, password);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new RuntimeException("Invalid username or password!");
        }
    }
    
    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found!"));
    }
    
    // Get user by username
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found!"));
    }
    
    // Get all students
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }
    
    // Get all admins
    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.Role.ADMIN);
    }
    
    // Update user wallet address
    public User updateWalletAddress(Long userId, String walletAddress) {
        User user = getUserById(userId);
        user.setWalletAddress(walletAddress);
        return userRepository.save(user);
    }
    
    // Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}