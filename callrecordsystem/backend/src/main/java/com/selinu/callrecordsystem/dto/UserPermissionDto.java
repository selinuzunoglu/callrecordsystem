package com.selinu.callrecordsystem.dto;

public class UserPermissionDto {
    private Long permissionId;
    private String code;
    private String name;
    private String description;
    private boolean disabled;
    private boolean hasOverride;

    public UserPermissionDto(Long permissionId, String code, String name, String description, boolean disabled, boolean hasOverride) {
        this.permissionId = permissionId;
        this.code = code;
        this.name = name;
        this.description = description;
        this.disabled = disabled;
        this.hasOverride = hasOverride;
    }

    public Long getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDisabled() {
        return disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }

    public boolean isHasOverride() {
        return hasOverride;
    }

    public void setHasOverride(boolean hasOverride) {
        this.hasOverride = hasOverride;
    }
} 