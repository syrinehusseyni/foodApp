package com.fooddelivery.restaurant_service.controller;

import com.fooddelivery.restaurant_service.client.OrderClient;
import com.fooddelivery.restaurant_service.dto.OrderDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantOrderController {

    private final OrderClient orderClient;

    private String extractJwt(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    @PreAuthorize("hasRole('RESTAURANT')")
    @GetMapping("/{restaurantId}/orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @PathVariable Long restaurantId,
            HttpServletRequest request) {
        String token = extractJwt(request);
        return ResponseEntity.ok(orderClient.getOrdersByRestaurant("Bearer " + token, restaurantId));
    }

    @PreAuthorize("hasRole('RESTAURANT')")
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            HttpServletRequest request) {
        String token = extractJwt(request);
        return ResponseEntity.ok(orderClient.updateOrderStatus("Bearer " + token, orderId, status));
    }
}