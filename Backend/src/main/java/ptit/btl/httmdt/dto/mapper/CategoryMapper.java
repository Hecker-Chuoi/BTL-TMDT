package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import ptit.btl.httmdt.dto.response.CategoryResponse;
import ptit.btl.httmdt.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}

