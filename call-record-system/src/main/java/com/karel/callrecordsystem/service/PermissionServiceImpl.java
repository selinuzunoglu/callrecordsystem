package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.Permission;
import com.karel.callrecordsystem.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository repository;

    @Autowired
    public PermissionServiceImpl(PermissionRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Permission> getAll() {
        return repository.findAll();
    }

    @Override
    public Permission getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Permission save(Permission permission) {
        return repository.save(permission);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
