package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByCode(String code);
}
