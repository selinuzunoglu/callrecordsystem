package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.RolePermission;

import java.util.List;

public interface RolePermissionService {
    List<RolePermission> getAllRolePermissions();
    RolePermission saveRolePermission(RolePermission rolePermission);
}
