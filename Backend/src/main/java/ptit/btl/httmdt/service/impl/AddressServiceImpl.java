package ptit.btl.httmdt.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ptit.btl.httmdt.dto.mapper.AddressMapper;
import ptit.btl.httmdt.dto.request.AddressRequest;
import ptit.btl.httmdt.dto.response.AddressResponse;
import ptit.btl.httmdt.entity.Address;
import ptit.btl.httmdt.entity.User;
import ptit.btl.httmdt.repository.AddressRepository;
import ptit.btl.httmdt.repository.UserRepository;
import ptit.btl.httmdt.service.AddressService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AddressServiceImpl implements AddressService {
    AddressRepository addressRepository;
    UserRepository userRepository;
    AddressMapper addressMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(Long userId) {
        findUserById(userId);
        return addressRepository.findByUserId(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long userId, Long addressId) {
        return addressMapper.toResponse(findUserAddress(userId, addressId));
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = findUserById(userId);
        Address address = addressMapper.toEntity(request);
        address.setUser(user);
        address.setCreated_at(LocalDateTime.now());

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = findUserAddress(userId, addressId);
        addressMapper.updateEntity(address, request);

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = findUserAddress(userId, addressId);
        addressRepository.delete(address);
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
    }

    private Address findUserAddress(Long userId, Long addressId) {
        findUserById(userId);
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Address not found with id: " + addressId + " for user id: " + userId
                ));
    }
}

