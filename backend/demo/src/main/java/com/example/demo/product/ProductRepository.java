package com.example.demo.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Derived queries
    Page<Product> findByCategory_NameIgnoreCase(String name, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String q, Pageable pageable);
    Optional<Product> findByExternalId(Long externalId);

    Page<Product> findByPriceBetween(BigDecimal min, BigDecimal max, Pageable pageable);
    Page<Product> findByCategory_NameIgnoreCaseAndPriceBetween(String name, BigDecimal min, BigDecimal max, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndPriceBetween(String q, BigDecimal min, BigDecimal max, Pageable pageable);

    // Flexible combined filters
    @Query("""
         SELECT p FROM Product p
         WHERE (:category IS NULL OR p.category.name = :category)
           AND (:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')))
        """)
    Page<Product> findProducts(@Param("category") String category,
                               @Param("query") String query,
                               Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Product> searchByName(@Param("query") String query, Pageable pageable);
}
