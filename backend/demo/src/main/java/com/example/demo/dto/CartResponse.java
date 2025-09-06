package com.example.demo.dto;

import com.example.demo.entity.Cart;

import java.util.List;
import java.util.stream.Collectors;

public class CartResponse {
    private Long id;
    private String sessionId;
    private List<CartItemResponse> items;
    private double totalAmount;
    private int totalItems;

    // Constructors
    public CartResponse() {}

    public CartResponse(Cart cart) {
        this.id = cart.getId();
        this.sessionId = cart.getSessionId();
        this.items = cart.getItems().stream()
                .map(CartItemResponse::new)
                .collect(Collectors.toList());
        this.totalAmount = cart.getTotalAmount();
        this.totalItems = cart.getTotalItems();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
}

