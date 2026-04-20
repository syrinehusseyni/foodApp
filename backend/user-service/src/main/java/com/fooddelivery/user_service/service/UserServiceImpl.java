package com.fooddelivery.user_service.service;

import com.fooddelivery.user_service.dto.UserDTO;
import com.fooddelivery.user_service.dto.UserRegisterDTO;
import com.fooddelivery.user_service.exception.UserNotFoundException;
import com.fooddelivery.user_service.model.User;
import com.fooddelivery.user_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Convert User entity to DTO
    private UserDTO toDTO(User user) {
        return new UserDTO(
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getUsername(),
                user.getId()
        );
    }

    // Convert DTO to User entity (only for registration)
    private User toEntity(UserDTO dto, String password) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setUsername(dto.getUsername());
        user.setRole(dto.getRole());

        // Hash password for registration
        user.setPassword(passwordEncoder.encode(password));

        return user;
    }

    @Override
    public UserDTO registerUser(UserRegisterDTO registerDTO) {
        User user = new User();
        user.setEmail(registerDTO.getEmail());
        user.setFullName(registerDTO.getFullName());
        user.setUsername(registerDTO.getUsername());
        user.setRole(registerDTO.getRole());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // hash password

        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return toDTO(user);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return toDTO(user);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO updatedDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        // Only update name and username
        user.setFullName(updatedDTO.getFullName());
        user.setUsername(updatedDTO.getUsername());

        User updatedUser = userRepository.save(user);
        return toDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        userRepository.deleteById(id);
    }
}