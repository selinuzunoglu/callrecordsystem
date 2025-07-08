package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
}
