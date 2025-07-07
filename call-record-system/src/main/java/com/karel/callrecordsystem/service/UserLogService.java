package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.UserLog;
import java.util.List;

public interface UserLogService {
    List<UserLog> getAll();
    UserLog getById(Long id);
    UserLog create(UserLog userLog);
    UserLog update(Long id, UserLog userLog);
    void delete(Long id);
}
