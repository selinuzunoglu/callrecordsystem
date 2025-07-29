package com.selinu.callrecordsystem.service;

import com.selinu.callrecordsystem.model.User;
import com.selinu.callrecordsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + username));
        // Şifre null ise boş string dön (ör: davetli kullanıcılar için)
        String password = user.getPassword() != null ? user.getPassword() : "";
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(password)
            .authorities("USER") // Gerekirse roller eklenebilir
            .accountLocked(false)
            .disabled(false)
            .build();
    }
} 