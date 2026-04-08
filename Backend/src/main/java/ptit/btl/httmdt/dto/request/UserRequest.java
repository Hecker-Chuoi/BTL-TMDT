package ptit.btl.httmdt.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ptit.btl.httmdt.entity.enums.Role;

@Data
public class UserRequest {
    @Email(message = "Email is invalid")
    @NotBlank(message = "Email is required")
    String email;

    @NotBlank(message = "Password is required")
    String password;

    @NotBlank(message = "Full name is required")
    String full_name;

    @NotBlank(message = "Phone is required")
    String phone;

    Role role;
    String status;
}

