package ptit.btl.httmdt.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AddressResponse {
    Long id;
    String receiver_name;
    String phone;
    String address_line;
    String city;
    String district;
    String ward;
    boolean is_default;
    LocalDateTime created_at;
    Long user_id;
}

