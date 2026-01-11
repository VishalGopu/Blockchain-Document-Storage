package com.educhain.document_system.controller;



import com.educhain.document_system.model.Document;
import com.educhain.document_system.model.User;
import com.educhain.document_system.model.VerificationResult;
import com.educhain.document_system.service.DocumentService;
import com.educhain.document_system.service.GeminiVerificationService;
import com.educhain.document_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpSession;
import java.io.File;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private GeminiVerificationService geminiVerificationService;
    
    // Upload document (Admin only)
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentId") Long studentId,
            @RequestParam(value = "documentType", defaultValue = "General") String documentType,
            @RequestParam(value = "description", defaultValue = "") String description,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if user is admin
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                response.put("success", false);
                response.put("message", "Access denied! Admin only.");
                return ResponseEntity.ok(response);
            }
            
            // ✅ NEW: VERIFY DOCUMENT WITH GEMINI AI
            VerificationResult verificationResult = geminiVerificationService.verifyDocument(file, documentType);
            
            if (!verificationResult.isVerified()) {
                response.put("success", false);
                response.put("verified", false);
                response.put("message", verificationResult.getMessage());
                response.put("detectedType", verificationResult.getDetectedType());
                response.put("confidence", verificationResult.getConfidenceScore());
                return ResponseEntity.ok(response);
            }
            
            // Get student
            User student = userService.getUserById(studentId);
            
            // Upload document - only if verified
            Document document = documentService.uploadDocument(file, student, documentType, description);
            
            response.put("success", true);
            response.put("verified", true);
            response.put("message", "Document verified and uploaded successfully!");
            response.put("documentId", document.getId());
            response.put("filename", document.getFilename());
            response.put("confidence", verificationResult.getConfidenceScore());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Get documents for current user
    @GetMapping("/my-documents")
    public ResponseEntity<Map<String, Object>> getMyDocuments(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Not logged in");
                return ResponseEntity.ok(response);
            }
            
            List<Document> documents;
            
            if (currentUser.getRole() == User.Role.STUDENT) {
                // Students see only their documents
                documents = documentService.getDocumentsByStudent(currentUser);
            } else {
                // Admins see all documents
                documents = documentService.getAllDocuments();
            }
            
            // Convert to response format
            List<Map<String, Object>> documentList = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            
            for (Document doc : documents) {
                Map<String, Object> docMap = new HashMap<>();
                docMap.put("id", doc.getId());
                docMap.put("filename", doc.getFilename());
                docMap.put("documentType", doc.getDocumentType());
                docMap.put("description", doc.getDescription());
                docMap.put("fileSize", doc.getFileSize());
                docMap.put("uploadDate", doc.getUploadDate().format(formatter));
                docMap.put("studentUsername", doc.getStudent().getUsername());
                docMap.put("studentId", doc.getStudent().getId());
                docMap.put("blockchainTxHash", doc.getBlockchainTxHash());
                documentList.add(docMap);
            }
            
            response.put("success", true);
            response.put("documents", documentList);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to load documents: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Download document
    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            HttpSession session) {
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = documentService.getDocumentById(documentId);
            
            // Check access permissions
            if (currentUser.getRole() == User.Role.STUDENT && 
                !document.getStudent().getId().equals(currentUser.getId())) {
                return ResponseEntity.notFound().build();
            }
            
            File file = new File(document.getFilePath());
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + document.getFilename() + "\"")
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Verify document integrity
    @GetMapping("/verify/{documentId}")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable Long documentId,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Not logged in");
                return ResponseEntity.ok(response);
            }
            
            Document document = documentService.getDocumentById(documentId);
            
            // Check access permissions
            if (currentUser.getRole() == User.Role.STUDENT && 
                !document.getStudent().getId().equals(currentUser.getId())) {
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.ok(response);
            }
            
            boolean isValid = documentService.verifyDocumentIntegrity(documentId);
            
            response.put("success", true);
            response.put("isValid", isValid);
            response.put("message", isValid ? "Document is authentic" : "Document has been tampered with");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Verification failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Get all students (for admin document upload)
    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getAllStudents(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.ok(response);
            }
            
            List<User> students = userService.getAllStudents();
            
            List<Map<String, Object>> studentList = new ArrayList<>();
            for (User student : students) {
                Map<String, Object> studentMap = new HashMap<>();
                studentMap.put("id", student.getId());
                studentMap.put("username", student.getUsername());
                studentList.add(studentMap);
            }
            
            response.put("success", true);
            response.put("students", studentList);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to load students: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Delete document (Admin only)
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable Long documentId,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.ok(response);
            }
            
            documentService.deleteDocument(documentId);
            
            response.put("success", true);
            response.put("message", "Document deleted successfully");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Delete failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}