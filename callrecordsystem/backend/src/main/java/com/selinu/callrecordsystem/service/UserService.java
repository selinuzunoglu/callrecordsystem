package com.selinu.callrecordsystem.service;

import com.selinu.callrecordsystem.model.User;
import com.selinu.callrecordsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.selinu.callrecordsystem.dto.UserUpdateRequest;
import com.selinu.callrecordsystem.dto.UserListDto;
import com.selinu.callrecordsystem.model.UserPermission;
import com.selinu.callrecordsystem.repository.UserPermissionRepository;
import java.util.Map;
import com.selinu.callrecordsystem.model.Permission;
import com.selinu.callrecordsystem.repository.PermissionRepository;
import com.selinu.callrecordsystem.dto.UserPermissionDto;
import java.util.ArrayList;
import java.util.HashMap;
import com.selinu.callrecordsystem.model.UserRole;
import com.selinu.callrecordsystem.model.Role;
import com.selinu.callrecordsystem.model.RolePermission;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{3,}$");
    private final JavaMailSender mailSender;
    private final UserPermissionRepository userPermissionRepository;
    private final PermissionRepository permissionRepository;

    @Autowired
    public UserService(UserRepository userRepository, JavaMailSender mailSender, UserPermissionRepository userPermissionRepository, PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.userPermissionRepository = userPermissionRepository;
        this.permissionRepository = permissionRepository;
    }

    public boolean isEmailValid(String email) {
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean isUsernameValid(String username) {
        return true;
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User createUser(String username, String email, String name, String surname) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setName(name);
        user.setSurname(surname);
        user.setPassword(null); // Şifre henüz yok
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setResetValidUntil(LocalDateTime.now().plusDays(1)); // 24 saat geçerli
        user.setStatus("Davet Gönderildi");
        User savedUser = userRepository.save(user);
        sendInvitationEmail(savedUser);
        return savedUser;
    }

    public void activateUser(User user) {
        user.setStatus("Aktif");
        userRepository.save(user);
    }

    public void sendInvitationEmail(User user) {
        String subject = "Karel Çağrı Sistemi - Hoş Geldiniz";

        String baseUrl = "http://localhost:3000";
        String resetLink = baseUrl + "/reset-password?token=" + user.getPasswordResetToken() + "&email=" + user.getEmail();
        String content = String.format("Merhaba %s %s,<br><br>Çağrı sistemine davet edildiniz.<br>Şifrenizi belirlemek için <a href=\"%s\">buraya tıklayın</a>.<br><br>Bu bağlantı 24 saat geçerlidir.", user.getName(), user.getSurname(), resetLink);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("info@karelcall.com.tr");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {

            e.printStackTrace();
        }
    }

    public boolean sendResetPasswordMail(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setResetValidUntil(LocalDateTime.now().plusHours(1)); // 1 saat geçerli
        userRepository.save(user);
        sendResetPasswordEmail(user);
        return true;
    }

    public void sendResetPasswordEmail(User user) {
        String subject = "Karel Çağrı Sistemi - Şifre Sıfırlama";
        String baseUrl = "http://localhost:3000";
        String resetLink = baseUrl + "/reset-password?token=" + user.getPasswordResetToken() + "&email=" + user.getEmail();
        String content = String.format("Merhaba %s %s,<br><br>Şifrenizi sıfırlamak için <a href=\"%s\">buraya tıklayın</a>.<br><br>Bu bağlantı 1 saat geçerlidir.", user.getName(), user.getSurname(), resetLink);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("info@karelcall.com.tr");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public Optional<User> findByResetToken(String token) {
        return userRepository.findAll().stream().filter(u -> token.equals(u.getPasswordResetToken())).findFirst();
    }

    public List<UserListDto> getAllUsersWithStatus() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user ->
            new UserListDto(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus() != null ? user.getStatus() : ""
            )
        ).collect(java.util.stream.Collectors.toList());
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public boolean updateUserPermissionDisabled(Long userId, Long permissionId, boolean disabled) {
        Optional<UserPermission> upOpt = userPermissionRepository.findByUserIdAndPermissionId(userId, permissionId);
        if (upOpt.isPresent()) {
            UserPermission up = upOpt.get();
            up.setDisabled(disabled);
            userPermissionRepository.save(up);
            return true;
        }
        return false;
    }

    public List<UserPermissionDto> getUserPermissionsWithAllPermissions(Long userId) {
        List<Permission> allPerms = permissionRepository.findAll();
        User user = userRepository.findById(userId).orElse(null);
        List<UserRole> userRoles = user != null ? user.getUserRoles() : new ArrayList<>();
        boolean isAdmin = userRoles.stream().anyMatch(ur -> "admin".equalsIgnoreCase(ur.getRole().getCode()));

        List<UserPermission> userPerms = userPermissionRepository.findByUserId(userId);
        Map<Long, UserPermission> userPermMap = new HashMap<>();
        for (UserPermission up : userPerms) {
            userPermMap.put(up.getPermission().getId(), up);
        }
        // Kullanıcının rollerinden gelen izinleri bul
        Set<Long> rolePermissionIds = new HashSet<>();
        for (UserRole ur : userRoles) {
            Role role = ur.getRole();
            if (role != null && role.getRolePermissions() != null) {
                for (RolePermission rp : role.getRolePermissions()) {
                    if (rp.getPermission() != null) {
                        rolePermissionIds.add(rp.getPermission().getId());
                    }
                }
            }
        }
        List<UserPermissionDto> result = new ArrayList<>();
        for (Permission perm : allPerms) {
            boolean disabled;
            boolean hasOverride = false;
            UserPermission up = userPermMap.get(perm.getId());
            if (up != null) {
                disabled = up.isDisabled();
                hasOverride = true;
            } else if (isAdmin && rolePermissionIds.contains(perm.getId())) {
                // admin rolünde ve rolde bu izin varsa açık
                disabled = false;
            } else if (rolePermissionIds.contains(perm.getId())) {
                disabled = false;
            } else {
                disabled = true;
            }
            result.add(new UserPermissionDto(
                perm.getId(),
                perm.getCode(),
                perm.getName(),
                perm.getDescription(),
                disabled,
                hasOverride
            ));
        }
        return result;
    }
} 