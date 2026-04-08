package ptit.btl.httmdt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Receiver name is required")
    String receiver_name;

    @NotBlank(message = "Phone is required")
    String phone;

    @NotBlank(message = "Address line is required")
    String address_line;

    @NotBlank(message = "City is required")
    String city;

    @NotBlank(message = "District is required")
    String district;

    @NotBlank(message = "Ward is required")
    String ward;

    boolean is_default;
}

