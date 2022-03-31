package com.hcl.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.hcl.dto.PaymentInfo;
import com.hcl.dto.Purchase;
import com.hcl.dto.PurchaseResponse;
import com.hcl.model.Address;
import com.hcl.model.Customer;
import com.hcl.model.Order;
import com.hcl.model.OrderItem;
import com.hcl.service.CheckoutService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

@ExtendWith(MockitoExtension.class)
class CheckoutControllerTest {

	@Mock
	private CheckoutService checkoutService;

	@InjectMocks
	private CheckoutController checkoutController;

	@Test
	void testPlaceOrder() {
		// given
		Purchase purchase = new Purchase();

		Customer customer = new Customer();
		customer.setId((long) 1);
		customer.setFirstName("Test");
		customer.setLastName("Dummy");
		customer.setEmail("testing@email.com");

		Address shippingAddress = new Address();
		shippingAddress.setId((long) 1);
		shippingAddress.setStreet("Dummy Street");
		shippingAddress.setCity("Dummy City");
		shippingAddress.setState("Dummy State");
		shippingAddress.setCountry("Dummy Country");
		shippingAddress.setZipCode("Dummy ZipCode");

		Address billingAddress = new Address();
		billingAddress.setId((long) 1);
		billingAddress.setStreet("Dummy Street");
		billingAddress.setCity("Dummy City");
		billingAddress.setState("Dummy State");
		billingAddress.setCountry("Dummy Country");
		billingAddress.setZipCode("Dummy ZipCode");

		Order order = new Order();
		order.setId((long) 1);
		order.setOrderTrackingNumber("032932476704");
		order.setTotalQuantity(1);
		order.setTotalPrice(BigDecimal.valueOf(7.99));
		order.setStatus("Arriving today by 3PM");
	
		OrderItem orderItem = new OrderItem();
		orderItem.setId((long) 1);
		orderItem.setImageUrl("dummy/image_url");
		orderItem.setUnitPrice(BigDecimal.valueOf(2.99));
		orderItem.setQuantity(1);
		orderItem.setProductId((long) 1);
		orderItem.setOrder(order);

		Set<OrderItem> orderItems = new HashSet<>();
		orderItems.add(orderItem);

		// when
		purchase.setOrderItems(orderItems);
		purchase.setCustomer(customer);
		purchase.setShippingAddress(shippingAddress);
		purchase.setBillingAddress(billingAddress);
		purchase.setOrder(order);
		
		PurchaseResponse response=new PurchaseResponse(order.getOrderTrackingNumber());

		// then
        Mockito.when((PurchaseResponse) checkoutService.placeOrder(Mockito.any())).thenReturn(response);
        PurchaseResponse testIntent = checkoutController.placeOrder(purchase);
        assertEquals(response, testIntent);
	}
	
	 @Test
	    void testCreatePaymentIntent() throws StripeException {

	        PaymentInfo paymentInfo = new PaymentInfo();
	        paymentInfo.setAmount(200);
	        paymentInfo.setCurrency("USD");
	        paymentInfo.setReceiptEmail("john@doe.com");

	        PaymentIntent expectedIntent = new PaymentIntent();
	        expectedIntent.setAmount((long) paymentInfo.getAmount());
	        expectedIntent.setCurrency(paymentInfo.getCurrency());
	        expectedIntent.setReceiptEmail(paymentInfo.getReceiptEmail());

	        Mockito.when(checkoutService.createPaymentIntent(Mockito.any(PaymentInfo.class))).thenReturn(expectedIntent);

	        String expectedString = expectedIntent.toJson();

	        ResponseEntity<String> responseEntity = checkoutController.createPaymentIntent(paymentInfo);

	        assertThat(responseEntity.getStatusCodeValue()).isEqualTo(200);
	        assertThat(responseEntity.getBody()).isEqualTo(expectedString);

	    }

}
