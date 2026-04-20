package com.fooddelivery.admin_service.controller;

import com.fooddelivery.admin_service.dto.LoginRequest;
import com.fooddelivery.admin_service.dto.LoginResponse;
import com.fooddelivery.admin_service.dto.ErrorResponse;
import com.fooddelivery.admin_service.model.Admin;
import com.fooddelivery.admin_service.repository.AdminRepository;
import com.fooddelivery.admin_service.util.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    private final JwtTokenProvider tokenProvider;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtTokenProvider tokenProvider,
                          AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder) {
        this.tokenProvider = tokenProvider;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Admin admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return buildResponse(email, "ADMIN");
        }

        return ResponseEntity.badRequest().body(new ErrorResponse("Invalid credentials"));
    }

    private ResponseEntity<?> buildResponse(String email, String role) {
        String token = tokenProvider.generateToken(email, List.of("ROLE_" + role));
        return ResponseEntity.ok(new LoginResponse(token, email));
    }
}