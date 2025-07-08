package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.Permission;
import java.util.List;

public interface PermissionService {
    List<Permission> getAll();
    Permission getById(Long id);
    Permission save(Permission permission);
    void delete(Long id);
}
