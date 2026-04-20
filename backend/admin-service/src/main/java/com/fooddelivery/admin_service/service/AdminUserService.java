package com.fooddelivery.admin_service.service;

import com.fooddelivery.admin_service.client.UserClient;
import com.fooddelivery.admin_service.dto.UserDTO;
import com.fooddelivery.admin_service.dto.RatingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserClient userClient;

    // Pass the JWT token from admin login
    public UserDTO getUserById(Long id, String jwtToken) {
        return userClient.getUserById(id, "Bearer " + jwtToken);
    }

    public UserDTO getUserByEmail(String email, String jwtToken) {
        return userClient.getUserByEmail(email, "Bearer " + jwtToken);
    }

    public void deleteUser(Long id, String jwtToken) {
        userClient.deleteUser(id, "Bearer " + jwtToken);
    }

    public List<RatingDTO> getRatingsByUser(Long userId, String jwtToken) {
        return userClient.getRatingsByUser(userId, "Bearer " + jwtToken);
    }
}