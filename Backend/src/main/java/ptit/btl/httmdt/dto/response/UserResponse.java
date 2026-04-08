package ptit.btl.httmdt.dto.response;

import lombok.Data;
import ptit.btl.httmdt.entity.enums.Role;

import java.time.LocalDateTime;

@Data
public class UserResponse {
	Long id;
	String email;
	String full_name;
	String phone;
	Role role;
	String status;
	LocalDateTime created_at;
	LocalDateTime updated_at;
}
