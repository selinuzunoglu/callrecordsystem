package com.selinu.callrecordsystem.repository;

import com.selinu.callrecordsystem.model.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface DataSourceRepository extends JpaRepository<DataSource, Long> {
} 