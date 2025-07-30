package com.selinu.callrecordsystem.dto;

public class UserListDto {
    public Long id;
    public String name;
    public String surname;
    public String username;
    public String email;
    public String status;

    public UserListDto(Long id, String name, String surname, String username, String email, String status) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.status = status;
    }

    public String getUsername() {
        return username;
    }
}
