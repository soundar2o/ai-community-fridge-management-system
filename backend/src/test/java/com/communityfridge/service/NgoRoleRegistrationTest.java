package com.communityfridge.service;

import com.communityfridge.dto.AuthResponse;
import com.communityfridge.dto.LoginRequest;
import com.communityfridge.dto.RegisterRequest;
import com.communityfridge.dto.UserDto;
import com.communityfridge.model.Role;
import com.communityfridge.model.User;
import com.communityfridge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class NgoRoleRegistrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    public void testNgoRegistrationAndLogin() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("New NGO Org");
        registerRequest.setEmail("ngo_new@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setPhone("9876543210");
        registerRequest.setRole(Role.NGO);

        UserDto registered = authService.register(registerRequest);
        assertNotNull(registered);
        assertEquals(Role.NGO, registered.getRole());
        assertEquals("ngo_new@test.com", registered.getEmail());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("ngo_new@test.com");
        loginRequest.setPassword("password123");

        AuthResponse loginResponse = authService.login(loginRequest);
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getToken());
        assertEquals(Role.NGO, loginResponse.getUser().getRole());
    }

    @Test
    public void testRoleEnumContainsAllRoles() {
        assertEquals(5, Role.values().length);
        assertNotNull(Role.valueOf("ADMIN"));
        assertNotNull(Role.valueOf("DONOR"));
        assertNotNull(Role.valueOf("RECEIVER"));
        assertNotNull(Role.valueOf("VOLUNTEER"));
        assertNotNull(Role.valueOf("NGO"));
    }
}
