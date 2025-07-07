package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
}
