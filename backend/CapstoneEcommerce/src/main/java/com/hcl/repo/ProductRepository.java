package com.hcl.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.hcl.model.Product;

// CrossOrigin annotation allows API to accept call from web browser scripts from this origin
// scheme/protocol+hostname+port
// If CrossOrigin annotation if used alone will allow any website to connect to API
@CrossOrigin("http://localhost:4200") 
public interface ProductRepository extends JpaRepository<Product, Long>{

}
