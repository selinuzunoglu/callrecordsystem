package com.selinu.callrecordsystem.service;

import com.selinu.callrecordsystem.model.User;
import com.selinu.callrecordsystem.repository.UserRepository;
import com.selinu.callrecordsystem.repository.UserRoleRepository;
import com.selinu.callrecordsystem.repository.UserPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
import com.selinu.callrecordsystem.util.JwtUtil;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserRoleRepository userRoleRepository;
    @Autowired
    private UserPermissionRepository userPermissionRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Şifre hatalı");
        }

        Map<String, Object> response = new HashMap<>();
        // Gerçek JWT token oluştur
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        claims.put("userId", user.getId());
        String token = jwtUtil.generateToken(user.getUsername(), claims);
        response.put("token", token);
        response.put("username", user.getUsername());

        // Kullanıcının rollerini bul
        List<com.selinu.callrecordsystem.model.UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        Set<String> rolePermCodes = new HashSet<>();
        for (com.selinu.callrecordsystem.model.UserRole ur : userRoles) {
            if (ur.getRole() != null && ur.getRole().getRolePermissions() != null) {
                for (com.selinu.callrecordsystem.model.RolePermission rp : ur.getRole().getRolePermissions()) {
                    if (rp.getPermission() != null) {
                        rolePermCodes.add(rp.getPermission().getCode());
                    }
                }
            }
        }
        List<com.selinu.callrecordsystem.model.UserPermission> userPerms = userPermissionRepository.findByUserId(user.getId());
        Set<String> openPerms = new HashSet<>();
        for (com.selinu.callrecordsystem.model.UserPermission up : userPerms) {
            if (!up.isDisabled()) {
                openPerms.add(up.getPermission().getCode());
            } else {
                // override ile kapalıysa, rol olsa bile eklenmesin
                rolePermCodes.remove(up.getPermission().getCode());
            }
        }
        // override ile açık olanlar + override yoksa rolünde olanlar
        openPerms.addAll(rolePermCodes);
        response.put("role", userRoles.isEmpty() ? "user" : userRoles.get(0).getRole().getCode());
        response.put("permissions", new ArrayList<>(openPerms));
        return response;
    }
}
