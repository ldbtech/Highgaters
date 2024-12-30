from stripe_module import StripeManager

# Initialize the StripeManager
stripe_manager = StripeManager()

# Create a PaymentIntent
try:
    amount = 1000  # $10 in cents
    client_secret = stripe_manager.create_payment_intent(amount)
    print(f"PaymentIntent created successfully. Client Secret: {client_secret}")
except Exception as e:
    print(f"Error: {e}")

# Calculate Total with Platform Fee
amount = 1000  # $10 in cents
platform_fee_percent = 10  # 10%
total, fee = stripe_manager.calculating_fee(amount, platform_fee_percent)
print(f"Total Amount: {total} cents (Platform Fee: {fee} cents)")
