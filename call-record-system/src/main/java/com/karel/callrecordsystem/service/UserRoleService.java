package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.UserRole;

import java.util.List;

public interface UserRoleService {
    List<UserRole> getAllUserRoles();
    UserRole saveUserRole(UserRole userRole);
}
