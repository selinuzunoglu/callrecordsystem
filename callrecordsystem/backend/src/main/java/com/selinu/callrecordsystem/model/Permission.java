  package com.selinu.callrecordsystem.model;
  import jakarta.persistence.*;
  import lombok.*;
import java.util.List;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private String description;

    @OneToMany(mappedBy = "permission")
    private List<UserPermission> userPermissions;

    @OneToMany(mappedBy = "permission")
    private List<RolePermission> rolePermissions;
}