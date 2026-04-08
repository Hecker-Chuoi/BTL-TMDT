package ptit.btl.httmdt.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;
import ptit.btl.httmdt.dto.request.AddressRequest;
import ptit.btl.httmdt.dto.response.AddressResponse;
import ptit.btl.httmdt.entity.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toResponse(Address address);

    Address toEntity(AddressRequest request);

    void updateEntity(@MappingTarget Address address, AddressRequest request);
}


