package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.CallLog;

import java.util.List;

public interface CallLogService {
    List<CallLog> getAll();
    CallLog getById(Long id);
    CallLog create(CallLog callLog);
    CallLog update(Long id, CallLog callLog);
    void delete(Long id);
}
