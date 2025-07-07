package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.DataSource;
import java.util.List;

public interface DataSourceService {
    List<DataSource> getAllDataSources();
    DataSource getDataSourceById(Long id);
    DataSource createDataSource(DataSource dataSource);
    DataSource updateDataSource(Long id, DataSource dataSource);
    void deleteDataSource(Long id);
}

