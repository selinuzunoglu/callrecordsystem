package com.selinu.callrecordsystem.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import com.selinu.callrecordsystem.model.UserRole;
import java.util.List;

public interface UserRoleRepository extends CrudRepository<UserRole, Long> {
    @Query("SELECT r.code FROM UserRole ur JOIN ur.role r WHERE ur.user.id = :userId")
    List<String> findRoleCodesByUserId(Long userId);
    List<UserRole> findByUserId(Long userId);
}
