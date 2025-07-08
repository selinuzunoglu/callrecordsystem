package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.UserPermission;
import com.karel.callrecordsystem.repository.UserPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserPermissionServiceImpl implements UserPermissionService {

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Override
    public List<UserPermission> getAll() {
        return userPermissionRepository.findAll();
    }

    @Override
    public UserPermission getById(Long id) {
        return userPermissionRepository.findById(id).orElse(null);
    }

    @Override
    public UserPermission create(UserPermission userPermission) {
        return userPermissionRepository.save(userPermission);
    }

    @Override
    public UserPermission update(Long id, UserPermission userPermission) {
        Optional<UserPermission> existing = userPermissionRepository.findById(id);
        if (existing.isPresent()) {
            userPermission.setId(id);
            return userPermissionRepository.save(userPermission);
        } else {
            return null;
        }
    }

    @Override
    public void delete(Long id) {
        userPermissionRepository.deleteById(id);
    }
}
