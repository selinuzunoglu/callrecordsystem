package com.karel.callrecordsystem.repository;

import com.karel.callrecordsystem.entity.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataSourceRepository extends JpaRepository<DataSource, Long> {
}
