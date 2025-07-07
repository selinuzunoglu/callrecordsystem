package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.UserPermission;
import com.karel.callrecordsystem.service.UserPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-permissions")
public class UserPermissionController {

    @Autowired
    private UserPermissionService userPermissionService;

    @GetMapping
    public List<UserPermission> getAll() {
        return userPermissionService.getAll();
    }

    @GetMapping("/{id}")
    public UserPermission getById(@PathVariable Long id) {
        return userPermissionService.getById(id);
    }

    @PostMapping
    public UserPermission create(@RequestBody UserPermission userPermission) {
        return userPermissionService.create(userPermission);
    }

    @PutMapping("/{id}")
    public UserPermission update(@PathVariable Long id, @RequestBody UserPermission userPermission) {
        return userPermissionService.update(id, userPermission);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userPermissionService.delete(id);
    }
}
