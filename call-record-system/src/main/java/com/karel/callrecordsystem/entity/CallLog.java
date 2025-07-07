package com.karel.callrecordsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bu çağrı hangi çağrıdan yönlendirilmiş (sadece bir önceki çağrı olabilir)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_from", unique = true) // UNIQUE: bir çağrı sadece bir çağrıdan gelir
    private CallLog transferFrom;

    // Bu çağrı hangi çağrıya yönlendirilmiş (sadece bir sonraki çağrı olabilir)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transferred_to", unique = true) // UNIQUE: bir çağrı sadece bir çağrıya gider
    private CallLog transferredTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private DataSource source;

    @Column(name = "caller_phone_nr", length = 20)
    private String callerPhoneNr;

    @Column(name = "called_phone_nr", length = 20)
    private String calledPhoneNr;

    @Column(name = "call_type", length = 20)
    private String callType;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private Integer duration;

    @Column(name = "audio_recording_file", length = 255)
    private String audioRecordingFile;
}
