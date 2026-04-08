package ptit.btl.httmdt.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ptit.btl.httmdt.dto.mapper.BrandMapper;
import ptit.btl.httmdt.dto.request.BrandRequest;
import ptit.btl.httmdt.dto.response.BrandResponse;
import ptit.btl.httmdt.entity.Brand;
import ptit.btl.httmdt.repository.BrandRepository;
import ptit.btl.httmdt.service.BrandService;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandServiceImpl implements BrandService {
    BrandRepository brandRepository;
    BrandMapper brandMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(brandMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(Long id) {
        return brandMapper.toResponse(findBrandById(id));
    }

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.getName());
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = findBrandById(id);
        brand.setName(request.getName());
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = findBrandById(id);
        brandRepository.delete(brand);
    }

    private Brand findBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
    }
}

