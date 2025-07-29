package com.selinu.callrecordsystem.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import com.selinu.callrecordsystem.model.UserPermission;
import java.util.List;
import java.util.Optional;

public interface UserPermissionRepository extends CrudRepository<UserPermission, Long> {
    @Query("SELECT p.code FROM UserPermission up JOIN up.permission p WHERE up.user.id = :userId AND up.disabled = false")
    List<String> findPermissionCodesByUserId(Long userId);
    Optional<UserPermission> findByUserIdAndPermissionId(Long userId, Long permissionId);
    List<UserPermission> findByUserId(Long userId);
}
