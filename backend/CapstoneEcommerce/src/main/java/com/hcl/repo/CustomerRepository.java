package com.hcl.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long>{

	Customer findByEmail(String theEmail);
}
