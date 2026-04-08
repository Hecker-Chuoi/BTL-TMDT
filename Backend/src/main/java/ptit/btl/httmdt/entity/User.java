package ptit.btl.httmdt.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import ptit.btl.httmdt.entity.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue
    long id;
    String email;
    String password;
    String full_name;
    String phone;
    Role role;
    String status;
    LocalDateTime created_at;
    LocalDateTime updated_at;

    @OneToMany(mappedBy = "user", orphanRemoval = true)
    List<Address> addresses;
}
