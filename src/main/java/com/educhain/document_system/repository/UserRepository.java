package com.educhain.document_system.repository;


import com.educhain.document_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by username
    Optional<User> findByUsername(String username);
    
    // Check if username exists
    boolean existsByUsername(String username);
    
    // Find user by username and password (for login)
    Optional<User> findByUsernameAndPassword(String username, String password);
    
    // Find users by role
    java.util.List<User> findByRole(User.Role role);
}