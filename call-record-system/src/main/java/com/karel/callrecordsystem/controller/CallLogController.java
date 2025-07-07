package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.CallLog;
import com.karel.callrecordsystem.service.CallLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/call-logs")
public class CallLogController {

    @Autowired
    private CallLogService callLogService;

    @GetMapping
    public List<CallLog> getAll() {
        return callLogService.getAll();
    }

    @GetMapping("/{id}")
    public CallLog getById(@PathVariable Long id) {
        return callLogService.getById(id);
    }

    @PostMapping
    public CallLog create(@RequestBody CallLog callLog) {
        return callLogService.create(callLog);
    }

    @PutMapping("/{id}")
    public CallLog update(@PathVariable Long id, @RequestBody CallLog callLog) {
        return callLogService.update(id, callLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        callLogService.delete(id);
    }
}
