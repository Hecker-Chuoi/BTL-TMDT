package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import ptit.btl.httmdt.dto.response.CategoryResponse;
import ptit.btl.httmdt.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}

