package ptit.btl.httmdt.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Name is required")
    String name;

    String description;

    @DecimalMin(value = "0.0", message = "Price must be >= 0")
    double price;

    @PositiveOrZero(message = "Stock must be >= 0")
    int stock;

    String status;

    @NotNull(message = "Brand id is required")
    Long brandId;

    @NotNull(message = "Category id is required")
    Long categoryId;
}

