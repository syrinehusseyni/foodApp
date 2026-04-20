package com.fooddelivery.user_service.controller;

import com.fooddelivery.user_service.client.DeliveryClient;
import com.fooddelivery.user_service.dto.DeliveryTrackingDTO;
import com.fooddelivery.user_service.dto.RatingDTO;
import com.fooddelivery.user_service.dto.UserDTO;
import com.fooddelivery.user_service.dto.UserRegisterDTO;
import com.fooddelivery.user_service.model.Rating;
import com.fooddelivery.user_service.service.RatingService;
import com.fooddelivery.user_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RatingService ratingService;
    private final DeliveryClient deliveryClient;  // ← add this

    private String extractJwt(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserRegisterDTO registerDTO) {
        UserDTO registeredUser = userService.registerUser(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @PostMapping("/ratings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RatingDTO> addRating(@RequestBody RatingDTO dto) {
        Rating saved = ratingService.addRatingFromDTO(dto);
        return ResponseEntity.ok(ratingService.toDTO(saved));
    }

    @GetMapping("/{userId}/ratings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RatingDTO>> getRatingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getRatingsByUser(userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ← add this
    @GetMapping("/delivery/{id}/track")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<DeliveryTrackingDTO> trackDelivery(
            @PathVariable Long id,
            HttpServletRequest request) {
        String token = extractJwt(request);
        return ResponseEntity.ok(deliveryClient.trackDelivery("Bearer " + token, id));
    }
}