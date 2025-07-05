package com.karel.callrecordsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false, unique = true, length = 50)
    private String username;


    @Column(nullable = false, columnDefinition = "TEXT")
    private String password;



    @Column(nullable = false, unique = true, length = 100)
    private String email;


    @Column(length = 50)
    private String name;


    @Column(length = 50)
    private String surname;


    @Column(columnDefinition = "TEXT")
    private String passwordResetToken;


    private LocalDateTime resetValidUntil;



    private LocalDateTime deletedAt;



    @Column(length = 50)
    private String deletedBy;



    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserPermission> userPermissions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserLog> userLogs = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRole> userRoles = new ArrayList<>();



}
