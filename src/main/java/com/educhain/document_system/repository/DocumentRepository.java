package com.educhain.document_system.repository;



import com.educhain.document_system.model.Document;
import com.educhain.document_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    // Find all documents for a specific student
    List<Document> findByStudent(User student);
    
    // Find documents by student ID
    List<Document> findByStudentId(Long studentId);
    
    // Find document by file hash
    Optional<Document> findByFileHash(String fileHash);
    
    // Find documents by document type
    List<Document> findByDocumentType(String documentType);
    
    // Find documents by filename containing text
    List<Document> findByFilenameContaining(String filename);
    
    // Count documents for a student
    long countByStudentId(Long studentId);
}