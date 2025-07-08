package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.CallLog;
import com.karel.callrecordsystem.repository.CallLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CallLogServiceImpl implements CallLogService {

    @Autowired
    private CallLogRepository callLogRepository;

    @Override
    public List<CallLog> getAll() {
        return callLogRepository.findAll();
    }

    @Override
    public CallLog getById(Long id) {
        return callLogRepository.findById(id).orElse(null);
    }

    @Override
    public CallLog create(CallLog callLog) {
        return callLogRepository.save(callLog);
    }

    @Override
    public CallLog update(Long id, CallLog callLog) {
        Optional<CallLog> existing = callLogRepository.findById(id);
        if (existing.isPresent()) {
            callLog.setId(id);
            return callLogRepository.save(callLog);
        } else {
            return null;
        }
    }

    @Override
    public void delete(Long id) {
        callLogRepository.deleteById(id);
    }
}
