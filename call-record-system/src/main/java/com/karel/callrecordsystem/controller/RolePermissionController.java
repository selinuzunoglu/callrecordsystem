package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.RolePermission;
import com.karel.callrecordsystem.service.RolePermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-permissions")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @Autowired
    public RolePermissionController(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    @GetMapping
    public List<RolePermission> getAllRolePermissions() {
        return rolePermissionService.getAllRolePermissions();
    }

    @PostMapping
    public RolePermission createRolePermission(@RequestBody RolePermission rolePermission) {
        return rolePermissionService.saveRolePermission(rolePermission);
    }
}
