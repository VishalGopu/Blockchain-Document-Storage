package com.educhain.document_system.service;


import com.educhain.document_system.model.Document;
import com.educhain.document_system.model.User;
import com.educhain.document_system.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    // Upload document for a student
    public Document uploadDocument(MultipartFile file, User student, String documentType, String description) {
        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String filename = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(filename);
            
            // Save file to disk
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Calculate file hash
            String fileHash = calculateFileHash(file.getBytes());
            
            // Create document record
            Document document = new Document(originalFilename, filePath.toString(), fileHash, student);
            document.setFileSize(file.getSize());
            document.setDocumentType(documentType);
            document.setDescription(description);
            
            // Save to database
            document = documentRepository.save(document);
            
            // Store hash on blockchain (async)
            try {
                String txHash = blockchainService.storeDocumentHash(fileHash, student.getWalletAddress());
                document.setBlockchainTxHash(txHash);
                document = documentRepository.save(document);
            } catch (Exception e) {
                System.err.println("Blockchain storage failed: " + e.getMessage());
            }
            
            return document;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    // Get documents for a student
    public List<Document> getDocumentsByStudent(User student) {
        return documentRepository.findByStudent(student);
    }
    
    // Get documents by student ID
    public List<Document> getDocumentsByStudentId(Long studentId) {
        return documentRepository.findByStudentId(studentId);
    }
    
    // Get document by ID
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found!"));
    }
    
    // Verify document integrity
    public boolean verifyDocumentIntegrity(Long documentId) {
        try {
            Document document = getDocumentById(documentId);
            
            // Read file and calculate current hash
            byte[] fileBytes = Files.readAllBytes(Paths.get(document.getFilePath()));
            String currentHash = calculateFileHash(fileBytes);
            
            // Compare with stored hash
            boolean hashMatches = currentHash.equals(document.getFileHash());
            
            // Verify on blockchain if transaction hash exists
            boolean blockchainVerified = true;
            if (document.getBlockchainTxHash() != null) {
                blockchainVerified = blockchainService.verifyDocumentHash(document.getFileHash());
            }
            
            return hashMatches && blockchainVerified;
            
        } catch (Exception e) {
            System.err.println("Verification failed: " + e.getMessage());
            return false;
        }
    }
    
    // Delete document
    public void deleteDocument(Long documentId) {
        Document document = getDocumentById(documentId);
        
        // Delete file from disk
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }
        
        // Delete from database
        documentRepository.deleteById(documentId);
    }
    
    // Get all documents (for admin)
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
    
    // Calculate SHA-256 hash of file
    private String calculateFileHash(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileBytes);
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Hash calculation failed", e);
        }
    }
}