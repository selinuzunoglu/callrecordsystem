package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.CallRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallRecordRepository extends JpaRepository<CallRecord, Long> {
    //  özel sorgular
}
