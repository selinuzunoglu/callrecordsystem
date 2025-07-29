package com.selinu.callrecordsystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import javax.sql.DataSource;
import java.sql.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.selinu.callrecordsystem.util.JwtUtil;
import com.selinu.callrecordsystem.service.AuthService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> response = authService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            // 1. Kullanıcıyı email ve token ile bul
            String sql = "SELECT * FROM users WHERE email = ? AND password_reset_token = ? AND reset_valid_until > now()";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, request.getEmail());
            stmt.setString(2, request.getToken());
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                // 2. Şifreyi hashle ve güncelle
                String hashedPassword = passwordEncoder.encode(request.getPassword());
                String updateSql = "UPDATE users SET password = ?, password_reset_token = NULL, reset_valid_until = NULL, status = 'Aktif' WHERE email = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, hashedPassword);
                updateStmt.setString(2, request.getEmail());
                updateStmt.executeUpdate();
                return ResponseEntity.ok("Şifre başarıyla güncellendi.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token geçersiz veya süresi doldu.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Sunucu hatası: " + e.getMessage());
        }
    }

    // DTO'lar
    public static class LoginRequest {
        private String username;
        private String password;
        // getter ve setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private String role; // ekle
        private String username;

        public LoginResponse(String token, String role, String username) {
            this.token = token;
            this.role = role;
            this.username = username;
        }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String token;
        private String password;
        // getter ve setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
