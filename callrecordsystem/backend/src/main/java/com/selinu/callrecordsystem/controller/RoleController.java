package com.selinu.callrecordsystem.controller;

import com.selinu.callrecordsystem.model.Role;
import com.selinu.callrecordsystem.model.RolePermission;
import com.selinu.callrecordsystem.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleRepository roleRepository;

    @Autowired
    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping("/{roleId}/permissions")
    public List<Map<String, Object>> getRolePermissions(@PathVariable Long roleId) {
        Role role = roleRepository.findById(roleId).orElse(null);
        if (role == null || role.getRolePermissions() == null) return Collections.emptyList();
        return role.getRolePermissions().stream()
            .map(rp -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("permissionId", rp.getPermission().getId());
                dto.put("code", rp.getPermission().getCode());
                dto.put("name", rp.getPermission().getName());
                dto.put("description", rp.getPermission().getDescription());
                return dto;
            })
            .collect(Collectors.toList());
    }
} 