package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.dto.LoginRequest;
import com.karel.callrecordsystem.dto.LoginResponse;
import com.karel.callrecordsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Giriş isteği alındı. Kullanıcı adı: {}", request.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            logger.info("Kimlik doğrulama başarılı. Kullanıcı: {}", request.getUsername());
            String token = jwtUtil.generateToken(request.getUsername());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception ex) {
            logger.error("Kimlik doğrulama başarısız! Kullanıcı adı: {}, Şifre: {}", request.getUsername(), maskPassword(request.getPassword()));
            logger.error("Hata detayı:", ex); // Stack trace ile birlikte logla
            return ResponseEntity.status(403).body("Giriş başarısız: " + ex.getMessage());
        }
    }

    // Şifreyi maskeler
    private String maskPassword(String password) {
        if (password == null) return null;
        if (password.length() <= 2) return "**";
        return password.charAt(0) + "***" + password.charAt(password.length() - 1);
    }
}
