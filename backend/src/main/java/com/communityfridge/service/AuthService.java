package com.communityfridge.service;

import com.communityfridge.dto.AuthResponse;
import com.communityfridge.dto.LoginRequest;
import com.communityfridge.dto.RegisterRequest;
import com.communityfridge.dto.UserDto;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    UserDto register(RegisterRequest registerRequest);
    UserDto getCurrentUser(String email);
}
