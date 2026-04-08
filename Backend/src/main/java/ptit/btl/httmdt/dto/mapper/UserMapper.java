package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import ptit.btl.httmdt.dto.request.UserRequest;
import ptit.btl.httmdt.dto.response.UserResponse;
import ptit.btl.httmdt.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    User toEntity(UserRequest request);
}


