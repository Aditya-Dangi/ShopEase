package com.example.demo.product;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ProductSyncScheduler {

    private final ProductSyncService sync;

    public ProductSyncScheduler(ProductSyncService sync) {
        this.sync = sync;
    }

    // Every hour
    @Scheduled(cron = "0 0 * * * *")
    public void hourlySync() {
        try {
            sync.syncAll(null);
        } catch (Exception ignored) {
            // In a real app, log the exception
        }
    }
}
