package com.communityfridge.service;

import com.communityfridge.dto.DashboardStatsDto;
import com.communityfridge.dto.UserDto;
import com.communityfridge.model.Role;

import java.util.List;

public interface AdminDashboardService {
    DashboardStatsDto getDashboardStats();
    List<UserDto> getAllUsers();
    UserDto updateUserRole(Long userId, Role newRole);
    void deleteUser(Long userId);
}
