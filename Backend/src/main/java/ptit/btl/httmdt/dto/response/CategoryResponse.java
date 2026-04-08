package ptit.btl.httmdt.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryResponse {
    Long id;
    String name;
    Long parentId;
    LocalDateTime createdAt;
}

