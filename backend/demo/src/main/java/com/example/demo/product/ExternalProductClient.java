package com.example.demo.product;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Component
public class ExternalProductClient {

    private final RestTemplate http = new RestTemplate();
    private static final String BASE = "https://fakestoreapi.com/products";

    public List<FakeStoreProduct> list(String category) throws RestClientException {
        FakeStoreProduct[] raw;
        if (category != null && !category.isBlank()) {
            String enc = java.net.URLEncoder.encode(category, StandardCharsets.UTF_8);
            raw = http.getForObject(BASE + "/category/" + enc, FakeStoreProduct[].class);
        } else {
            raw = http.getForObject(BASE, FakeStoreProduct[].class);
        }
        if (raw == null) return List.of();
        return Arrays.asList(raw);
    }

    public FakeStoreProduct find(Long id) throws RestClientException {
        return http.getForObject(BASE + "/{id}", FakeStoreProduct.class, id);
    }
}
