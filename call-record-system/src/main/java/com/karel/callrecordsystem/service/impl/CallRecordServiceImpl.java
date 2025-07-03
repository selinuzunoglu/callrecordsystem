package com.karel.callrecordsystem.service.impl;

import com.karel.callrecordsystem.entity.CallRecord;
import com.karel.callrecordsystem.repository.CallRecordRepository;
import com.karel.callrecordsystem.service.CallRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CallRecordServiceImpl implements CallRecordService {

    private final CallRecordRepository callRecordRepository;

    @Autowired
    public CallRecordServiceImpl(CallRecordRepository callRecordRepository) {
        this.callRecordRepository = callRecordRepository;
    }

    @Override
    public List<CallRecord> getAllRecords() {
        return callRecordRepository.findAll();
    }

    @Override
    public CallRecord getRecordById(Long id) {
        return callRecordRepository.findById(id).orElse(null);
    }

    @Override
    public CallRecord saveRecord(CallRecord record) {
        return callRecordRepository.save(record);
    }
}

