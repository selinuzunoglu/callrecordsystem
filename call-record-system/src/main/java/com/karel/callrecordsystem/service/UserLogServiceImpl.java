package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.UserLog;
import com.karel.callrecordsystem.repository.UserLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserLogServiceImpl implements UserLogService {

    @Autowired
    private UserLogRepository userLogRepository;

    @Override
    public List<UserLog> getAll() {
        return userLogRepository.findAll();
    }

    @Override
    public UserLog getById(Long id) {
        return userLogRepository.findById(id).orElse(null);
    }

    @Override
    public UserLog create(UserLog userLog) {
        return userLogRepository.save(userLog);
    }

    @Override
    public UserLog update(Long id, UserLog userLog) {
        Optional<UserLog> existing = userLogRepository.findById(id);
        if (existing.isPresent()) {
            userLog.setId(id);
            return userLogRepository.save(userLog);
        } else {
            return null;
        }
    }

    @Override
    public void delete(Long id) {
        userLogRepository.deleteById(id);
    }
}
