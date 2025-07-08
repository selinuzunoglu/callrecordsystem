package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CallLogRepository extends JpaRepository<CallLog, Long> {
}
