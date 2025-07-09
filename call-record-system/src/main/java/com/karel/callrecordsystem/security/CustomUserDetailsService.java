package com.karel.callrecordsystem.security;

import com.karel.callrecordsystem.entity.Users;
import com.karel.callrecordsystem.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Kullanıcı adı ile giriş deneniyor: {}", username);

        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Kullanıcı bulunamadı: {}", username);
                    return new UsernameNotFoundException("Kullanıcı bulunamadı: " + username);
                });

        logger.info("Kullanıcı bulundu: {}, disabled = {}", user.getUsername(), user.isDisabled());
        return new CustomUserDetails(user);
    }
}
