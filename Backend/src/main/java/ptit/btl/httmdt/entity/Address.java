package ptit.btl.httmdt.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address {
    @Id
    @GeneratedValue
    Long id;
    String receiver_name;
    String phone;
    String address_line;
    String city;
    String district;
    String ward;
    boolean is_default;
    LocalDateTime created_at;

    @ManyToOne
    User user;
}
