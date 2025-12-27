package com.educhain.document_system.service;
// Service to handle blockchain interactions

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.gas.DefaultGasProvider;
import java.math.BigInteger;

@Service
public class BlockchainService {
    
    @Value("${blockchain.rpc.url}")
    private String rpcUrl;
    
    @Value("${blockchain.private.key}")
    private String privateKey;
    
    private Web3j web3j;
    private Credentials credentials;
    
    // Initialize blockchain connection
    public void initializeBlockchain() {
        try {
            // Connect to Ganache
            web3j = Web3j.build(new HttpService(rpcUrl));
            
            // Load credentials (you'll set this later)
            if (privateKey != null && !privateKey.isEmpty()) {
                credentials = Credentials.create(privateKey);
            }
            
            System.out.println("Blockchain connection initialized!");
        } catch (Exception e) {
            System.err.println("Blockchain initialization failed: " + e.getMessage());
        }
    }
    
    // Store document hash on blockchain
    public String storeDocumentHash(String fileHash, String studentWallet) {
        try {
            if (web3j == null) {
                initializeBlockchain();
            }
            
            // For now, return a mock transaction hash
            // We'll implement the actual smart contract interaction later
            String mockTxHash = "0x" + generateMockTxHash();
            System.out.println("Document hash stored on blockchain: " + fileHash);
            System.out.println("Transaction Hash: " + mockTxHash);
            
            return mockTxHash;
            
        } catch (Exception e) {
            System.err.println("Failed to store on blockchain: " + e.getMessage());
            return null;
        }
    }
    
    // Verify document hash on blockchain
    public boolean verifyDocumentHash(String fileHash) {
        try {
            if (web3j == null) {
                initializeBlockchain();
            }
            
            // For now, return true (mock verification)
            // We'll implement actual verification with smart contract later
            System.out.println("Verifying document hash: " + fileHash);
            return true;
            
        } catch (Exception e) {
            System.err.println("Verification failed: " + e.getMessage());
            return false;
        }
    }
    
    // Check blockchain connection
    public boolean isBlockchainConnected() {
        try {
            if (web3j == null) {
                initializeBlockchain();
            }
            return web3j != null;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Get blockchain network version
    public String getNetworkVersion() {
        try {
            if (web3j == null) {
                initializeBlockchain();
            }
            return web3j.netVersion().send().getNetVersion();
        } catch (Exception e) {
            return "Unknown";
        }
    }
    
    // Generate mock transaction hash for testing
    private String generateMockTxHash() {
        return Long.toHexString(System.currentTimeMillis()) + 
               Integer.toHexString((int)(Math.random() * 1000000));
    }
}
