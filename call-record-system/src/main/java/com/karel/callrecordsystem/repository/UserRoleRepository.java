package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
}
