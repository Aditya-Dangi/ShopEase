package com.example.demo.product;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ProductSyncService {

    private final ExternalProductClient external;
    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductSyncService(ExternalProductClient external, ProductRepository products, CategoryRepository categories) {
        this.external = external;
        this.products = products;
        this.categories = categories;
    }

    @Transactional
    public int syncAll(String categoryFilter) {
        List<FakeStoreProduct> source = external.list(categoryFilter);
        int upserts = 0;
        for (FakeStoreProduct s : source) {
            upserts += upsertOne(s) ? 1 : 0;
        }
        return upserts;
    }

    @Transactional
    public boolean upsertOne(FakeStoreProduct s) {
        Product p = products.findByExternalId(s.id()).orElseGet(() -> {
            Product np = new Product();
            np.setExternalId(s.id());
            np.setCreatedAt(Instant.now());
            return np;
        });

        p.setName(s.title());
        p.setDescription(s.description());
        p.setPrice(s.price());
        p.setStock(p.getStock() == null ? 100 : p.getStock());
        p.setImageUrl(s.image());
        p.setLastUpdated(Instant.now());

        Category cat = categories.findByNameIgnoreCase(s.category())
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setName(s.category());
                    return categories.save(c);
                });
        p.setCategory(cat);

        products.save(p);
        return true;
    }
}
