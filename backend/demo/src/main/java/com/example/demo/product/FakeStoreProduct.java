package com.example.demo.product;

import java.math.BigDecimal;

public record FakeStoreProduct(
        Long id,
        String title,
        BigDecimal price,
        String description,
        String category,
        String image
) {}
