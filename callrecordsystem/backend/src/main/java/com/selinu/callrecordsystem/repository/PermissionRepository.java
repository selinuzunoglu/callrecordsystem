package com.selinu.callrecordsystem.repository;

import com.selinu.callrecordsystem.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
} 