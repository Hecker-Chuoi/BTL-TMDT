package ptit.btl.httmdt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ptit.btl.httmdt.entity.Brand;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
}

