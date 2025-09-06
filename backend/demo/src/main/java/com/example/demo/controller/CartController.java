package com.example.demo.controller;

import com.example.demo.dto.AddToCartRequest;
import com.example.demo.dto.CartResponse;
import com.example.demo.service.CartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:4200")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        CartResponse cart = cartService.getCart(sessionId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddToCartRequest addToCartRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        CartResponse cart = cartService.addToCart(sessionId, addToCartRequest);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long productId,
            @RequestParam int quantity,
            HttpServletRequest request,
            HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        CartResponse cart = cartService.updateCartItem(sessionId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long productId,
            HttpServletRequest request,
            HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        CartResponse cart = cartService.removeFromCart(sessionId, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = getOrCreateSessionId(request, response);
        cartService.clearCart(sessionId);
        return ResponseEntity.ok().build();
    }

    private String getOrCreateSessionId(HttpServletRequest request, HttpServletResponse response) {
        // Check for existing session ID in cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("CART_SESSION_ID".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Create new session ID
        String sessionId = cartService.generateSessionId();
        Cookie sessionCookie = new Cookie("CART_SESSION_ID", sessionId);
        sessionCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        sessionCookie.setPath("/");
        sessionCookie.setHttpOnly(true);
        response.addCookie(sessionCookie);

        return sessionId;
    }
}
