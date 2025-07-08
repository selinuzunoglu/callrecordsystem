package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.UserLog;
import com.karel.callrecordsystem.service.UserLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/userlogs")
public class UserLogController {

    @Autowired
    private UserLogService userLogService;

    @GetMapping
    public List<UserLog> getAll() {
        return userLogService.getAll();
    }

    @GetMapping("/{id}")
    public UserLog getById(@PathVariable Long id) {
        return userLogService.getById(id);
    }

    @PostMapping
    public UserLog create(@RequestBody UserLog userLog) {
        return userLogService.create(userLog);
    }

    @PutMapping("/{id}")
    public UserLog update(@PathVariable Long id, @RequestBody UserLog userLog) {
        return userLogService.update(id, userLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userLogService.delete(id);
    }
}
