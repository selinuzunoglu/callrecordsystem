package com.karel.callrecordsystem.config;

import com.karel.callrecordsystem.entity.Users;
import com.karel.callrecordsystem.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;
    private final UsersRepository usersRepository;

    @Bean
    public CommandLineRunner loadInitialData() {
        return args -> {
            if (usersRepository.findByUsername("admin").isEmpty()) {
                Users user = new Users();
                user.setUsername("admin");
                user.setPassword(passwordEncoder.encode("123")); // Şifre burada otomatik hashlenir
                user.setEmail("admin@example.com");
                user.setName("Admin");
                user.setSurname("User");

                usersRepository.save(user);
                System.out.println("✅ Admin kullanıcısı oluşturuldu: admin / 123");
            } else {
                System.out.println("ℹ️ Admin kullanıcısı zaten mevcut.");
            }

            // Manuel kullanıcı ekle
            if (usersRepository.findByUsername("testuser").isEmpty()) {
                Users user = new Users();
                user.setUsername("testuser");
                user.setPassword(passwordEncoder.encode("test123"));
                user.setEmail("testuser@example.com");
                user.setName("Test");
                user.setSurname("User");
                usersRepository.save(user);
                System.out.println("✅ Test kullanıcısı oluşturuldu: testuser / test123");
            } else {
                System.out.println("ℹ️ Test kullanıcısı zaten mevcut.");
            }
        };
    }
}
