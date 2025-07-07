package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Long> {
}
