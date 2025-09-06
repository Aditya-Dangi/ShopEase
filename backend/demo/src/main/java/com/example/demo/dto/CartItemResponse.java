package com.example.demo.dto;

import com.example.demo.entity.CartItem;
import com.example.demo.product.Product;
import java.math.BigDecimal;

public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice;   // use BigDecimal for money
    private int quantity;
    private BigDecimal subtotal;       // use BigDecimal for money

    public CartItemResponse() {}

    public CartItemResponse(CartItem cartItem) {
        this.id = cartItem.getId();
        Product product = cartItem.getProduct();
        this.productId = product.getId();
        this.productName = product.getName();
        this.productImageUrl = product.getImageUrl();
        this.productPrice = product.getPrice(); // BigDecimal from entity
        this.quantity = cartItem.getQuantity();
        this.subtotal = product.getPrice().multiply(BigDecimal.valueOf(this.quantity));
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public BigDecimal getProductPrice() { return productPrice; }
    public void setProductPrice(BigDecimal productPrice) { this.productPrice = productPrice; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
