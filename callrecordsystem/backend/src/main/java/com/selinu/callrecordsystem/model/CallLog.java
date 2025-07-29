package com.selinu.callrecordsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "call_id")
    private Integer callId;

    @Column(name = "transfer_from")
    private Integer transferFrom;

    @Column(name = "trasferred_to")
    private Integer transferredTo;

    @ManyToOne
    @JoinColumn(name = "source_id")
    @JsonBackReference
    private DataSource source;

    @Column(name = "caller_phone_nr")
    private String callerPhoneNr;
    @Column(name = "called_phone_nr")
    private String calledPhoneNr;
    @Column(name = "call_type")
    private String callType;
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    @Column(name = "duration")
    private Integer duration;
    @Column(name = "audio_recording_file")
    private String audioRecordingFile;
} 