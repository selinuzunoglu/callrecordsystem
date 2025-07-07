package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.DataSource;
import com.karel.callrecordsystem.repository.DataSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DataSourceServiceImpl implements DataSourceService {

    private final DataSourceRepository dataSourceRepository;

    @Autowired
    public DataSourceServiceImpl(DataSourceRepository dataSourceRepository) {
        this.dataSourceRepository = dataSourceRepository;
    }

    @Override
    public List<DataSource> getAllDataSources() {
        return dataSourceRepository.findAll();
    }

    @Override
    public DataSource getDataSourceById(Long id) {
        return dataSourceRepository.findById(id).orElse(null);
    }

    @Override
    public DataSource createDataSource(DataSource dataSource) {
        return dataSourceRepository.save(dataSource);
    }

    @Override
    public DataSource updateDataSource(Long id, DataSource dataSource) {
        Optional<DataSource> existing = dataSourceRepository.findById(id);
        if (existing.isPresent()) {
            dataSource.setId(id);
            return dataSourceRepository.save(dataSource);
        } else {
            return null;
        }
    }

    @Override
    public void deleteDataSource(Long id) {
        dataSourceRepository.deleteById(id);
    }
}
