package com.hcl.dto;

import java.util.Set;

import com.hcl.model.Address;
import com.hcl.model.Customer;
import com.hcl.model.Order;
import com.hcl.model.OrderItem;

import lombok.Data;

@Data
public class Purchase {
	
	private Customer customer;
	
	private Address shippingAddress;
	
	private Address billingAddress;
	
	private Order order;
	
	private Set<OrderItem> orderItems;

}
