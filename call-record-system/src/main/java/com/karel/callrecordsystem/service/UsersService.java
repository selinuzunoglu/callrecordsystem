package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.Users;
import java.util.List;

public interface UsersService {
    List<Users> getAllUsers();
    Users getUserById(Long id);
    Users createUser(Users user);
    void deleteUser(Long id);
}
