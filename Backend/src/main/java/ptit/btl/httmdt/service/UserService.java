package ptit.btl.httmdt.service;

import org.springframework.stereotype.Service;
import ptit.btl.httmdt.dto.request.UserRequest;
import ptit.btl.httmdt.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}

