package com.educhain.document_system;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DocumentSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocumentSystemApplication.class, args);
        System.out.println("EduChain Document System Started Successfully!");
        System.out.println("Access at: http://localhost:8080");
    }
}
