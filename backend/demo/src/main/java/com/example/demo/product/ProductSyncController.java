package com.example.demo.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductSyncController {

    private final ProductSyncService syncService;

    public ProductSyncController(ProductSyncService syncService) {
        this.syncService = syncService;
    }

    // Trigger: GET /api/sync/products or /api/sync/products?category=electronics
    @PostMapping("/products")
    public ResponseEntity<String> syncProducts(@RequestParam(required = false) String category) {
        int count = syncService.syncAll(category);
        return ResponseEntity.ok("Synced/updated: " + count + " products");
    }
}
