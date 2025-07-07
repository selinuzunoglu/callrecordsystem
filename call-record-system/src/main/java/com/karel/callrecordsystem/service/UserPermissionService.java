package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.UserPermission;
import java.util.List;

public interface UserPermissionService {
    List<UserPermission> getAll();
    UserPermission getById(Long id);
    UserPermission create(UserPermission userPermission);
    UserPermission update(Long id, UserPermission userPermission);
    void delete(Long id);
}
