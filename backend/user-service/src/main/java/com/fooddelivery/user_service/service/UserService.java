package com.fooddelivery.user_service.service;

import com.fooddelivery.user_service.dto.UserDTO;
import com.fooddelivery.user_service.dto.UserRegisterDTO;

public interface UserService {

    UserDTO registerUser(UserRegisterDTO registerDTO);

    UserDTO getUserById(Long id);

    UserDTO getUserByEmail(String email);

    UserDTO updateUser(Long id, UserDTO userDTO);

    void deleteUser(Long id);  // FIXED: was boolean
}