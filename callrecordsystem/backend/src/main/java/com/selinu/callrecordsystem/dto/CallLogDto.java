package com.selinu.callrecordsystem.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CallLogDto {
    private Long id;
    private String callId;
    private String switchboardName; // Santral adı (call_type'dan türetilecek)
    private Integer transferFrom;
    private Integer transferredTo;
    private Long sourceId;
    private String sourceName; // Santral adı (DataSource -> Pbx'den)
    private String callerPhoneNr;
    private String calledPhoneNr;
    private String callType;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer duration;
    private String audioRecordingFile;
} 