package com.example.demo.product;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String name,
        String description,
        String imageUrl,
        String category,
        BigDecimal price,
        Integer stock
) {}

