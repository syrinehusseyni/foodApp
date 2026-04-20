package com.fooddelivery.restaurant_service.client;

import com.fooddelivery.restaurant_service.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/orders/restaurant/{restaurantId}")
    List<OrderDTO> getOrdersByRestaurant(
            @RequestHeader("Authorization") String token,
            @PathVariable("restaurantId") Long restaurantId);

    @PutMapping("/api/orders/{id}/restaurant-status")
    OrderDTO updateOrderStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") Long orderId,
            @RequestParam("status") String status);
}