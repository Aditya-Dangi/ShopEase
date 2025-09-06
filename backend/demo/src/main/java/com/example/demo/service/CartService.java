package com.example.demo.service;

import com.example.demo.dto.AddToCartRequest;
import com.example.demo.dto.CartResponse;
import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.product.Product;
import com.example.demo.product.ProductRepository;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public CartResponse getCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        return new CartResponse(cart);
    }

    public CartResponse addToCart(String sessionId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(sessionId);

        // Load the product once, so it's available in both branches
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Create new cart item using the loaded product
            CartItem newItem = new CartItem(cart, product, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);
        return new CartResponse(cart);
    }



    public CartResponse updateCartItem(String sessionId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return new CartResponse(cart);
    }

    public CartResponse removeFromCart(String sessionId, Long productId) {
        Cart cart = getOrCreateCart(sessionId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cart.removeItem(item);
        cartItemRepository.delete(item);
        cartRepository.save(cart);

        return new CartResponse(cart);
    }

    public void clearCart(String sessionId) {
        Optional<Cart> cartOpt = cartRepository.findBySessionId(sessionId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart getOrCreateCart(String sessionId) {
        return cartRepository.findBySessionIdWithItems(sessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(sessionId);
                    return cartRepository.save(newCart);
                });
    }

    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }
}
