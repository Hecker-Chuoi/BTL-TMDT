package ptit.btl.httmdt.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ptit.btl.httmdt.dto.request.AddressRequest;
import ptit.btl.httmdt.dto.request.UserRequest;
import ptit.btl.httmdt.dto.response.AddressResponse;
import ptit.btl.httmdt.dto.response.UserResponse;
import ptit.btl.httmdt.service.AddressService;
import ptit.btl.httmdt.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;
    AddressService addressService;

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/addresses")
    public List<AddressResponse> getUserAddresses(@PathVariable Long userId) {
        return addressService.getAddressesByUserId(userId);
    }

    @GetMapping("/{userId}/addresses/{addressId}")
    public AddressResponse getUserAddressById(@PathVariable Long userId, @PathVariable Long addressId) {
        return addressService.getAddressById(userId, addressId);
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<AddressResponse> createUserAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse createdAddress = addressService.createAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public AddressResponse updateUserAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        return addressService.updateAddress(userId, addressId, request);
    }

    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteUserAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
