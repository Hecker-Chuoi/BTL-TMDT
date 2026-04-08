package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import ptit.btl.httmdt.dto.response.BrandResponse;
import ptit.btl.httmdt.entity.Brand;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    BrandResponse toResponse(Brand brand);
}

