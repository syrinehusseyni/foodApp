package com.fooddelivery.restaurant_service.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {
    private Long menuItemId;
    private Integer quantity;
    private BigDecimal price;
}