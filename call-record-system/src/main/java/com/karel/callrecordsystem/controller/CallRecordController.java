package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.CallRecord;
import com.karel.callrecordsystem.service.CallRecordService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/call-records")
public class CallRecordController {

    private final CallRecordService callRecordService;

    @Autowired
    public CallRecordController(CallRecordService callRecordService) {
        this.callRecordService = callRecordService;
    }

    @GetMapping
    public List<CallRecord> getAll() {
        return callRecordService.getAllRecords();
    }

    @GetMapping("/{id}")
    public CallRecord getById(@PathVariable Long id) {
        return callRecordService.getRecordById(id);
    }

    @PostMapping
    public CallRecord save(@RequestBody CallRecord record) {
        return callRecordService.saveRecord(record);
    }
}
