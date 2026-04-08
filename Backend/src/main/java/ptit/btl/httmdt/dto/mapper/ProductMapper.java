package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import ptit.btl.httmdt.dto.response.ProductResponse;
import ptit.btl.httmdt.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponse toResponse(Product product);
}

