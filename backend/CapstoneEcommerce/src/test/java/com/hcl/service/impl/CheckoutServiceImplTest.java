package com.hcl.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockedStatic.Verification;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hcl.dto.PaymentInfo;
import com.hcl.dto.Purchase;
import com.hcl.dto.PurchaseResponse;
import com.hcl.model.Address;
import com.hcl.model.Customer;
import com.hcl.model.Order;
import com.hcl.model.OrderItem;
import com.hcl.repo.CustomerRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceImplTest {

	@InjectMocks
	private CheckoutServiceImpl checkoutServiceImpl;
	
	@Mock 
	CustomerRepository customerRepository;
	
	@Test
	void testplaceOrderSuccessNewCustomer() {
		Purchase purchase = new Purchase();
		Customer customer = new Customer();
		Address shippingAddress = new Address();
		Address billingAddress = new Address();
		Order order = new Order();
		OrderItem item1 = new OrderItem();
		OrderItem item2 = new OrderItem();
		Set<OrderItem> orderItems = new HashSet<>();
		
		orderItems.add(item1);
		orderItems.add(item2);
		
		customer.setId((long) 123);
		customer.setFirstName("firstName");
		customer.setLastName("lastName");
		customer.setEmail("customer@email.com");
		
		shippingAddress.setId((long) 1);
		shippingAddress.setStreet("street name");
		shippingAddress.setCity("city name");
		shippingAddress.setState("state name");
		shippingAddress.setCountry("country name");
		shippingAddress.setZipCode("zip code");
		
		billingAddress.setId((long) 1);
		billingAddress.setStreet("street name");
		billingAddress.setCity("city name");
		billingAddress.setState("state name");
		billingAddress.setCountry("country name");
		billingAddress.setZipCode("zip code");
		
		order.setId((long) 1234);
		order.setTotalQuantity(2);
		order.setTotalPrice(BigDecimal.valueOf(25.98));
		order.setStatus("status");
		
		item1.setId((long) 123);
		item1.setImageUrl("imageURL/location");
		item1.setUnitPrice(BigDecimal.valueOf(12.99));
		item1.setQuantity(1);
		item1.setProductId((long) 1234567);
		
		item2.setId((long) 1123);
		item2.setImageUrl("imageURL/location2");
		item2.setUnitPrice(BigDecimal.valueOf(12.99));
		item2.setQuantity(1);
		item2.setProductId((long) 12345678);
		
		purchase.setCustomer(customer);
		purchase.setShippingAddress(shippingAddress);
		purchase.setBillingAddress(billingAddress);
		purchase.setOrder(order);
		purchase.setOrderItems(orderItems);
		
		Mockito.when(customerRepository.findByEmail(Mockito.anyString())).thenReturn(null);
		
		Mockito.when(customerRepository.save(Mockito.any())).thenReturn(null);
		
		PurchaseResponse response = checkoutServiceImpl.placeOrder(purchase);
		
		assertThat(response.getOrderTrackingNumber()).isNotNull();
	}
	
	@Test
	void testplaceOrderSuccessExistingCustomer() {
		Purchase purchase = new Purchase();
		Customer customer = new Customer();
		Address shippingAddress = new Address();
		Address billingAddress = new Address();
		Order order = new Order();
		OrderItem item1 = new OrderItem();
		OrderItem item2 = new OrderItem();
		Set<OrderItem> orderItems = new HashSet<>();
		
		orderItems.add(item1);
		orderItems.add(item2);
		
		customer.setId((long) 123);
		customer.setFirstName("firstName");
		customer.setLastName("lastName");
		customer.setEmail("customer@email.com");
		
		shippingAddress.setId((long) 1);
		shippingAddress.setStreet("street name");
		shippingAddress.setCity("city name");
		shippingAddress.setState("state name");
		shippingAddress.setCountry("country name");
		shippingAddress.setZipCode("zip code");
		
		billingAddress.setId((long) 1);
		billingAddress.setStreet("street name");
		billingAddress.setCity("city name");
		billingAddress.setState("state name");
		billingAddress.setCountry("country name");
		billingAddress.setZipCode("zip code");
		
		order.setId((long) 1234);
		order.setTotalQuantity(2);
		order.setTotalPrice(BigDecimal.valueOf(25.98));
		order.setStatus("status");
		
		item1.setId((long) 123);
		item1.setImageUrl("imageURL/location");
		item1.setUnitPrice(BigDecimal.valueOf(12.99));
		item1.setQuantity(1);
		item1.setProductId((long) 1234567);
		
		item2.setId((long) 1123);
		item2.setImageUrl("imageURL/location2");
		item2.setUnitPrice(BigDecimal.valueOf(12.99));
		item2.setQuantity(1);
		item2.setProductId((long) 12345678);
		
		purchase.setCustomer(customer);
		purchase.setShippingAddress(shippingAddress);
		purchase.setBillingAddress(billingAddress);
		purchase.setOrder(order);
		purchase.setOrderItems(orderItems);
		
		Mockito.when(customerRepository.findByEmail(Mockito.anyString())).thenReturn(customer);
		
		Mockito.when(customerRepository.save(Mockito.any())).thenReturn(null);
		
		PurchaseResponse response = checkoutServiceImpl.placeOrder(purchase);
		
		assertThat(response.getOrderTrackingNumber()).isNotNull();
	}

	@Test
	void testCreatePaymentIntentSuccess() throws StripeException {
		PaymentInfo paymentInfo = new PaymentInfo();
		paymentInfo.setAmount(2598);
		paymentInfo.setCurrency("USD");
		paymentInfo.setReceiptEmail("testing@email.com");
		
		PaymentIntent expectedIntent = new PaymentIntent();
		expectedIntent.setAmount((long) paymentInfo.getAmount());
		expectedIntent.setCurrency(paymentInfo.getCurrency());
		expectedIntent.setReceiptEmail(paymentInfo.getReceiptEmail());
		
		//test
		try (MockedStatic<PaymentIntent> mocked = Mockito.mockStatic(PaymentIntent.class)){
			
			mocked.when((Verification) PaymentIntent.create(Mockito.anyMap())).thenReturn(expectedIntent);
			PaymentIntent testIntent = checkoutServiceImpl.createPaymentIntent(paymentInfo);
			assertEquals(expectedIntent, testIntent);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}

}


