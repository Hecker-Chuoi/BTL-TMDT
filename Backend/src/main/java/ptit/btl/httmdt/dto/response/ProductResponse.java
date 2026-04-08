package ptit.btl.httmdt.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {
	Long id;
	String name;
	String description;
	double price;
	int stock;
	String status;
	LocalDateTime created_at;
	LocalDateTime updated_at;
	Long brandId;
	Long categoryId;
}
