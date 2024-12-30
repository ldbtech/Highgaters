import stripe
from dotenv import load_dotenv
import os

class StripeManager:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        if not stripe.api_key:
            raise ValueError("Stripe API key is not set. Check your .env file.")

    def create_payment_intent(self, amount: int, platform_fee_percent: float, freelancer_account_id: str, currency: str = "usd") -> dict:
        """
        Create a Stripe PaymentIntent with platform fees and transfer to freelancer.

        :param amount: Total amount to be paid by the client (in cents).
        :param platform_fee_percent: Percentage fee charged by the platform.
        :param freelancer_account_id: Stripe account ID of the freelancer.
        :param currency: Currency of the payment (default: "usd").
        :return: PaymentIntent object.
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        if not freelancer_account_id:
            raise ValueError("Freelancer account ID is required.")

        platform_fee = int(amount * (platform_fee_percent / 100))

        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                automatic_payment_methods={"enabled": True},
                application_fee_amount=platform_fee,  # Platform fee
                transfer_data={
                    "destination": freelancer_account_id,  # Freelancer account
                },
            )
            return payment_intent
        except Exception as e:
            raise ValueError(f"Error creating PaymentIntent: {e}")

    
    def issue_refund(self, payment_intent_id: str) -> dict:
        """
            Issue a refund for a given PaymentIntent

            :param payment_intent_id: The ID of the paymentIntent to refund 
            :return: Refund object
        """
        if not payment_intent_id:
            raise ValueError("PaymentIntent ID is required")

        try:
            refund = stripe.Refund.create(payment_intent=payment_intent_id)
            return refund
        except Exception as e:
            raise ValueError(f"Error issueing refund: {e}")
    
    def transfer_to_freelancer(self, amount: int, freelancer_account_id: str, currency:str = "usd") -> dict:
        """
            Transfer the funds to a freelancer after job completion 

            :param amount: Amount to be transferred in cents
            :param freelancer_account_id: Stripe Account ID OF the freelancer 
            :param currency: Default USD
            :preturn: Transfer Object
        """

        if not freelancer_account_id:
            raise ValueError("Freelancer account ID is required")
        
        if amount <= 0:
            raise ValueError("Amount must be greater than Zero")
        
        try:
            transfer = stripe.Transfer.create(
                amount=amount,
                currency=currency,
                destination=freelancer_account_id,
                description="Freelancer payment after platform fee deduction.",
            )
            return transfer
        except Exception as e:
            raise ValueError(f"Error Transferring funds: {e}")
    def check_account_status(self, account_id: str) -> dict:
        """
            Check the status and capabilities of a stripe account. 

            :param account_id: The ID of the stripe account to check
            :return: Account object
        """
        if not account_id:
            raise ValueError("Account ID is required")
        
        try:
            account = stripe.Account.retrieve(account_id)
            return account
        except Exception as e:
            raise ValueError(f"Error retrieving account status: {e}")
    
    def platform_fees(self, total_amount: int, platform_fee_parcent: float):
        platform_fee = int(total_amount * (platform_fee_parcent / 100))

        remaining_amount = total_amount - platform_fee
        return platform_fee, remaining_amount
    


## Testing
if __name__ == "__main__":
    stripe_manager = StripeManager()

    # Create payment Intent: 
    try:
        py_intent = stripe_manager.create_paymentIntent(amount=5000) # $50.00
        print(f"PaymentIntent Created: {py_intent}")
    except Exception as e:
        print(f"Error paymentIntent: {e}")
    
    # Test issueing refund 
    try:
        refund = stripe_manager.issue_refund(payment_intent_id="pi_3QbVSyP4FY4YX9oG1F0tGufc")
        print(f"Refund-->\n {refund}")
    except Exception as e:
        print(f"Error issuing refund: {e}")
