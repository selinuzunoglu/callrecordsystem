package com.selinu.callrecordsystem.dto;

public class RoleDto {
    public Long id;
    public String code;
    public String name;
    public String description;

    public RoleDto(Long id, String code, String name, String description) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
    }
} 