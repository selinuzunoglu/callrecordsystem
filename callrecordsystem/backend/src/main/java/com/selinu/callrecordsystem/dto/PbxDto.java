package com.selinu.callrecordsystem.dto;
import java.util.List;

public class PbxDto {
    public Long id;
    public String name;
    public Boolean active;
    public String created_at;
    public String created_by;
    public String updated_at;
    public String updated_by;
    public String deleted_at;
    public String deleted_by;
    public List<DataSourceDto> data_sources;
} 