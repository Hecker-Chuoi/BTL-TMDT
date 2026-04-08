package ptit.btl.httmdt.service;

import ptit.btl.httmdt.dto.request.ProductRequest;
import ptit.btl.httmdt.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}

