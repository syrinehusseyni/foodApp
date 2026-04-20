package com.fooddelivery.restaurant_service.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Long customerId;
    private Long restaurantId;
    private String status;
    private BigDecimal totalPrice;
    private List<OrderItemDTO> orderItems;
}