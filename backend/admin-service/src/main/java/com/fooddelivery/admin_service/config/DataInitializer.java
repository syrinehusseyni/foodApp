package com.fooddelivery.admin_service.config;

import com.fooddelivery.admin_service.model.Admin;
import com.fooddelivery.admin_service.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@freshbites.tn";
        String adminUsername = "admin";
        String adminPassword = "admin123";

        Optional<Admin> existingAdmin = adminRepository.findByEmail(adminEmail);

        if (existingAdmin.isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Admin.Role.ADMIN);

            adminRepository.save(admin);
            System.out.println("Default admin created: " + adminEmail);
        } else {
            System.out.println("Admin already exists: " + adminEmail);
        }
    }
}
