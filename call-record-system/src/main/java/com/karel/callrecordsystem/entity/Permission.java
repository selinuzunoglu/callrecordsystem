package com.karel.callrecordsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Opsiyonel: İlişkiler (istersen ekle, yoksa çıkarabilirsin)

    @OneToMany(mappedBy = "permission")
    private Set<UserPermission> userPermissions = new HashSet<>();

    @OneToMany(mappedBy = "permission")
    private Set<RolePermission> rolePermissions = new HashSet<>();
}


