package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.Permission;
import com.karel.callrecordsystem.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService service;

    @Autowired
    public PermissionController(PermissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Permission> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Permission getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Permission create(@RequestBody Permission permission) {
        return service.save(permission);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
