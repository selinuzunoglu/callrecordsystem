package com.selinu.callrecordsystem.controller;

import com.selinu.callrecordsystem.dto.UserUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.selinu.callrecordsystem.service.UserService;
import com.selinu.callrecordsystem.dto.UserListDto;
import com.selinu.callrecordsystem.model.User;
import com.selinu.callrecordsystem.dto.UserPermissionDto;
import com.selinu.callrecordsystem.model.UserPermission;
import com.selinu.callrecordsystem.repository.PermissionRepository;
import com.selinu.callrecordsystem.repository.UserPermissionRepository;
import com.selinu.callrecordsystem.repository.UserRepository;
import com.selinu.callrecordsystem.model.Permission;
import com.selinu.callrecordsystem.model.Role;
import com.selinu.callrecordsystem.model.UserRole;
import com.selinu.callrecordsystem.repository.UserRoleRepository;
import com.selinu.callrecordsystem.dto.RoleDto;
import com.selinu.callrecordsystem.repository.RoleRepository;
import com.selinu.callrecordsystem.model.RolePermission;
import java.util.Collections;

import java.util.Optional;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final UserPermissionRepository userPermissionRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserService userService, UserPermissionRepository userPermissionRepository, UserRepository userRepository, PermissionRepository permissionRepository, UserRoleRepository userRoleRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userPermissionRepository = userPermissionRepository;
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/invite")
    public ResponseEntity<?> inviteUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String name = body.get("name");
        String surname = body.get("surname");

        Map<String, String> errors = new HashMap<>();
        if (!userService.isUsernameValid(username)) {
            errors.put("username", "Geçersiz kullanıcı adı formatı.");
        }
        if (!userService.isEmailValid(email)) {
            errors.put("email", "Geçersiz e-posta formatı.");
        }
        if (userService.isUsernameTaken(username)) {
            errors.put("username", "Bu kullanıcı adı zaten kullanılıyor.");
        }
        if (userService.isEmailTaken(email)) {
            errors.put("email", "Bu e-posta zaten kullanılıyor.");
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        User user = userService.createUser(username, email, name, surname);
        // TODO: E-posta gönderimi burada yapılacak
        return ResponseEntity.ok(user);
    }

    @GetMapping("")
    public List<UserListDto> getAllUsers(@RequestParam(required = false) String username) {
        if (username != null) {
            // Username'e göre filtrele (case-insensitive)
            return userService.getAllUsersWithStatus().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .collect(Collectors.toList());
        }
        return userService.getAllUsersWithStatus();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest dto) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setName(dto.name);
        user.setSurname(dto.surname);
        user.setUsername(dto.username);
        user.setEmail(dto.email);
        userService.saveUser(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> sendResetPasswordMail(@PathVariable Long id) {
        boolean result = userService.sendResetPasswordMail(id);
        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{userId}/permissions/{permissionId}")
    public ResponseEntity<?> updateUserPermission(
            @PathVariable Long userId,
            @PathVariable Long permissionId,
            @RequestBody Map<String, Boolean> body) {
        Boolean disabled = body.get("disabled");
        if (disabled == null) {
            return ResponseEntity.badRequest().body("disabled alanı zorunlu");
        }
        // Kayıt var mı kontrol et
        Optional<UserPermission> upOpt = userPermissionRepository.findByUserIdAndPermissionId(userId, permissionId);
        if (upOpt.isPresent()) {
            // Kayıt varsa sadece disabled alanını güncelle
            UserPermission up = upOpt.get();
            up.setDisabled(disabled);
            userPermissionRepository.save(up);
        } else {
            // Kayıt yoksa sadece bir kere ekle, tekrar tekrar eklenmez
            UserPermission up = new UserPermission();
            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Permission> permOpt = permissionRepository.findById(permissionId);
            if (userOpt.isEmpty() || permOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Kullanıcı veya yetki bulunamadı");
            }
            up.setUser(userOpt.get());
            up.setPermission(permOpt.get());
            up.setDisabled(disabled);
            userPermissionRepository.save(up);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/permissions/{permissionId}")
    public ResponseEntity<?> removeUserPermissionOverride(@PathVariable Long userId, @PathVariable Long permissionId) {
        Optional<UserPermission> upOpt = userPermissionRepository.findByUserIdAndPermissionId(userId, permissionId);
        if (upOpt.isPresent()) {
            userPermissionRepository.delete(upOpt.get());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/permissions")
    public List<UserPermissionDto> getUserPermissions(@PathVariable Long userId) {
        return userService.getUserPermissionsWithAllPermissions(userId);
    }

    @GetMapping("/{id}/roles")
    public List<RoleDto> getUserRoles(@PathVariable Long id) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(id);
        return userRoles.stream()
            .map(ur -> new RoleDto(
                ur.getRole().getId(),
                ur.getRole().getCode(),
                ur.getRole().getName(),
                ur.getRole().getDescription()
            ))
            .collect(Collectors.toList());
    }

    @GetMapping("/roles")
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(r -> new RoleDto(r.getId(), r.getCode(), r.getName(), r.getDescription()))
            .collect(Collectors.toList());
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<?> assignRolesToUser(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        // Önce mevcut rolleri sil
        List<UserRole> existing = userRoleRepository.findByUserId(id);
        userRoleRepository.deleteAll(existing);
        // Sonra yeni rolleri ekle
        for (Long roleId : roleIds) {
            Role role = roleRepository.findById(roleId).orElse(null);
            User user = userRepository.findById(id).orElse(null);
            if (role != null && user != null) {
                userRoleRepository.save(new UserRole(null, user, role));
            }
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/roles/{roleId}")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long id, @PathVariable Long roleId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(id);
        for (UserRole ur : userRoles) {
            if (ur.getRole().getId().equals(roleId)) {
                userRoleRepository.delete(ur);
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles/{roleId}/permissions")
    public List<Map<String, Object>> getRolePermissions(@PathVariable Long roleId) {
        Role role = roleRepository.findById(roleId).orElse(null);
        if (role == null || role.getRolePermissions() == null) return Collections.emptyList();
        return role.getRolePermissions().stream()
            .map(rp -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("permissionId", rp.getPermission().getId());
                dto.put("code", rp.getPermission().getCode());
                dto.put("name", rp.getPermission().getName());
                dto.put("description", rp.getPermission().getDescription());
                return dto;
            })
            .collect(Collectors.toList());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        System.out.println("=== /me endpoint called ===");
        System.out.println("Principal: " + principal);
        if (principal != null) {
            System.out.println("Principal name: " + principal.getName());
        }
        
        if (principal == null || principal.getName() == null) {
            System.out.println("Principal is null or name is null");
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı");
        }
        
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        System.out.println("Found user: " + user);
        
        if (user == null) {
            System.out.println("User not found for username: " + principal.getName());
            return ResponseEntity.status(404).body("Kullanıcı bulunamadı");
        }
        
        // Response'u Map olarak oluştur
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("surname", user.getSurname());
        response.put("status", user.getStatus());
        
        System.out.println("Returning user data: " + user.getName() + " " + user.getSurname());
        System.out.println("Response JSON: " + response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByStatus("Aktif");
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("Error getting user stats: " + e.getMessage());
            return ResponseEntity.status(500).body("İstatistikler alınamadı");
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Principal principal, @RequestBody Map<String, Object> request) {
        System.out.println("=== PUT /me endpoint called ===");
        System.out.println("Principal: " + principal);
        System.out.println("Request body: " + request);
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı");
        }
        
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("Kullanıcı bulunamadı");
        }
        
        // Profil bilgilerini güncelle
        if (request.containsKey("name")) {
            user.setName((String) request.get("name"));
        }
        if (request.containsKey("surname")) {
            user.setSurname((String) request.get("surname"));
        }
        if (request.containsKey("username")) {
            user.setUsername((String) request.get("username"));
        }
        
        // Şifre değişikliği varsa
        if (request.containsKey("password") && request.containsKey("newPassword")) {
            String currentPassword = (String) request.get("password");
            String newPassword = (String) request.get("newPassword");
            
            // Mevcut şifreyi kontrol et
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Mevcut şifre hatalı");
            }
            
            // Yeni şifreyi hashle ve kaydet
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        
        userRepository.save(user);
        System.out.println("User updated successfully");
        return ResponseEntity.ok().build();
    }
} 