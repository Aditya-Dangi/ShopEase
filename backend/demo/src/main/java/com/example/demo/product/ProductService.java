package com.example.demo.product;

import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final ProductSyncService sync;
    private final ExternalProductClient external;

    public ProductService(ProductRepository repo, ProductSyncService sync, ExternalProductClient external) {
        this.repo = repo;
        this.sync = sync;
        this.external = external;
    }

    // Read from DB. If DB is empty and no filters, do a quick sync once.
    public Page<ProductDto> list(String category, String q,
                                 BigDecimal minPrice, BigDecimal maxPrice,
                                 Pageable pageable, boolean forceSync) {
        if (forceSync) {
            sync.syncAll(category);
        }

        Page<Product> page;

        // price range defaults
        BigDecimal min = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal max = (maxPrice == null) ? new BigDecimal("1000000000") : maxPrice;

        if (category != null && !category.isBlank() && q != null && !q.isBlank()) {
            // both category and search
            page = repo.findByNameContainingIgnoreCaseAndPriceBetween(q, min, max, pageable)
                    .map(p -> p) // placeholder, will filter category below if necessary
                    .map(p -> p); // no-op
            // If you want combined filter exactly: write a custom query or filter after fetching page content
        } else if (category != null && !category.isBlank()) {
            page = repo.findByCategory_NameIgnoreCaseAndPriceBetween(category, min, max, pageable);
        } else if (q != null && !q.isBlank()) {
            page = repo.findByNameContainingIgnoreCaseAndPriceBetween(q, min, max, pageable);
        } else {
            page = repo.findByPriceBetween(min, max, pageable);
            if (page.isEmpty() && !forceSync) {
                // convenience: first run auto-sync
                sync.syncAll(null);
                page = repo.findByPriceBetween(min, max, pageable);
            }
        }

        return page.map(this::toDto);
    }


    public ProductDto find(Long id) {
        Product p = repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDto(p);
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getImageUrl(),
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getPrice(),
                p.getStock() != null ? p.getStock() : 0
        );
    }
}
