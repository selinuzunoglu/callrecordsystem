package com.selinu.callrecordsystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_permission", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "permission_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "permission_id")
    private Permission permission;

    @Column(nullable = false)
    private boolean disabled = false;
}