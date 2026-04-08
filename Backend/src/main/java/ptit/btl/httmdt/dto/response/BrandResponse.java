package ptit.btl.httmdt.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BrandResponse {
    Long id;
    String name;
    LocalDateTime createdAt;
}

