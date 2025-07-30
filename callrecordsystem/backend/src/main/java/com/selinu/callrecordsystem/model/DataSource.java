package com.selinu.callrecordsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_source")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pbx_id")
    @JsonBackReference
    private Pbx pbx;

    @Column(name = "name")
    private String name;
    @Column(name = "ip")
    private String ip;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_by")
    private String updatedBy;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    @Column(name = "deleted_by")
    private String deletedBy;

    @Transient
    private Long pbx_id;

    public Long getPbx_id() { return pbx_id; }
    public void setPbx_id(Long pbx_id) { this.pbx_id = pbx_id; }

    @OneToMany(mappedBy = "source", fetch = FetchType.LAZY)
    @JsonManagedReference
    private java.util.List<CallLog> callLogs;
} 