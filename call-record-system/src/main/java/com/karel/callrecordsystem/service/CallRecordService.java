package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.CallRecord;
import java.util.List;

public interface CallRecordService {
    List<CallRecord> getAllRecords();
    CallRecord getRecordById(Long id);
    CallRecord saveRecord(CallRecord record);
}
