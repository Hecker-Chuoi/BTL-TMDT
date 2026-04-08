package ptit.btl.httmdt.service;

import ptit.btl.httmdt.dto.request.BrandRequest;
import ptit.btl.httmdt.dto.response.BrandResponse;

import java.util.List;

public interface BrandService {
    List<BrandResponse> getAllBrands();

    BrandResponse getBrandById(Long id);

    BrandResponse createBrand(BrandRequest request);

    BrandResponse updateBrand(Long id, BrandRequest request);

    void deleteBrand(Long id);
}

