package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.User;

public interface UserService {
    User register(String username, String password);
    User login(String username, String password);
}
