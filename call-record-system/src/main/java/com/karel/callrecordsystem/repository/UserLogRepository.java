package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLogRepository extends JpaRepository<UserLog, Long> {
}
