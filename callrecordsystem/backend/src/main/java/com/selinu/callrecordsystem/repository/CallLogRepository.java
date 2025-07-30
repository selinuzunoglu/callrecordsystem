package com.selinu.callrecordsystem.repository;

import com.selinu.callrecordsystem.model.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
 
public interface CallLogRepository extends JpaRepository<CallLog, Long> {
    List<CallLog> findByCallId(Integer callId);
    
    // Çok hızlı arama sorgusu
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.callerPhoneNr LIKE :search OR " +
           "c.calledPhoneNr LIKE :search OR " +
           "c.callType LIKE :search OR " +
           "CAST(c.id AS string) LIKE :search OR " +
           "s.pbx.name LIKE :search " +
           "ORDER BY c.id DESC")
    Page<CallLog> findBySearchTerm(@Param("search") String search, Pageable pageable);
    
    // Telefon numarasına göre çok hızlı arama (kısmi eşleşme)
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.callerPhoneNr LIKE %:phoneNumber% OR c.calledPhoneNr LIKE %:phoneNumber% " +
           "ORDER BY c.id DESC")
    Page<CallLog> findByPhoneNumber(@Param("phoneNumber") String phoneNumber, Pageable pageable);
    
    // Çok hızlı telefon araması (sadece son 4 hane)
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "RIGHT(c.callerPhoneNr, 4) = :phoneNumber OR RIGHT(c.calledPhoneNr, 4) = :phoneNumber " +
           "ORDER BY c.id DESC")
    Page<CallLog> findByPhoneLastDigits(@Param("phoneNumber") String phoneNumber, Pageable pageable);
    
    // ID'ye göre hızlı arama
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.id = :id")
    Page<CallLog> findByIdExact(@Param("id") Long id, Pageable pageable);
    
    // Çağrı tipine göre hızlı arama
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.callType = :callType")
    Page<CallLog> findByCallType(@Param("callType") String callType, Pageable pageable);
    
    // Çok hızlı tüm kayıtları getirme - sadece ID ile sırala
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx")
    Page<CallLog> findAllWithSourceAndPbx(Pageable pageable);
    
    // Tarih aralığına göre arama
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.startedAt BETWEEN :startDate AND :endDate")
    Page<CallLog> findByDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                 @Param("endDate") java.time.LocalDateTime endDate, 
                                 Pageable pageable);
    
    // Santral adına göre arama
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "s.pbx.name LIKE :pbxName")
    Page<CallLog> findByPbxName(@Param("pbxName") String pbxName, Pageable pageable);
    
    // Transfer bilgilerine göre arama
    @Query("SELECT c FROM CallLog c LEFT JOIN FETCH c.source s LEFT JOIN FETCH s.pbx WHERE " +
           "c.transferFrom = :transferFrom OR c.transferredTo = :transferredTo")
    Page<CallLog> findByTransferInfo(@Param("transferFrom") Integer transferFrom, 
                                    @Param("transferredTo") Integer transferredTo, 
                                    Pageable pageable);
} 