package com.karel.callrecordsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 50)
    private String name;

    @Column(length = 50)
    private String surname;

    private String passwordResetToken;

    private LocalDateTime resetValidUntil;

    private LocalDateTime deletedAt;

    @Column(length = 50)
    private String deletedBy;

    @Column(nullable = false)
    private boolean disabled = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Opsiyonel: Şifre tekrar alanı (sadece frontend içindir, DB'ye kaydedilmez)
    @Transient
    private String passwordConfirm;
}
