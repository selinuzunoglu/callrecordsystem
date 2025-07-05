package com.karel.callrecordsystem.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "call_logs")
public class CallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="call_id")
    private Long call_id;

    @OneToOne
    @JoinColumn(name = "transfer_from", referencedColumnName = "id", nullable = true)
    private CallLog transferFrom;

    @OneToOne
    @JoinColumn(name = "transferred_to", referencedColumnName = "id", nullable = true)
    private CallLog transferredTo;

    @ManyToOne
    @JoinColumn(name="source_id")
    private DataSource  dataSource;

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

    @Column(name = "audio_recording_file", columnDefinition = "TEXT")
    private String audioRecordingFile;






}
