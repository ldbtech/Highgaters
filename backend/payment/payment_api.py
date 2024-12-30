from flask import Flask, request, jsonify
from flask_cors import CORS
from stripe_module import StripeManager

app = Flask(__name__)
CORS(app)  # Allow Cross-Origin Requests
stripe_manager = StripeManager()

@app.route("/")
def home():
    return "Welcome to the Payment API"

@app.route("/api/create-payment-intent", methods=["POST"])
def create_payment_intent():
    try:
        data = request.json
        amount = data.get("amount")  # Total amount in cents
        platform_fee_percent = data.get("platform_fee_percent", 10)  # Default platform fee is 10%
        freelancer_account_id = data.get("freelancer_account_id")
        currency = data.get("currency", "usd")

        if not amount or not freelancer_account_id:
            return jsonify({"error": "Amount and freelancer account ID are required"}), 400

        payment_intent = stripe_manager.create_payment_intent(
            amount=int(amount),
            platform_fee_percent=float(platform_fee_percent),
            freelancer_account_id=freelancer_account_id,
            currency=currency,
        )
        
        return jsonify({"clientSecret": payment_intent["client_secret"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/issue-refund", methods=["POST"])
def issue_refund():
    try:
        data = request.json
        payment_intent_id = data.get("payment_intent_id")

        if not payment_intent_id:
            return jsonify({"error": "PaymentIntent ID is required"}), 400

        refund = stripe_manager.issue_refund(payment_intent_id=payment_intent_id)
        return jsonify({"refund": refund}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transfer-to-freelancer", methods=["POST"])
def transfer_to_freelancer():
    try:
        data = request.json
        amount = data.get("amount")  # Remaining amount after platform fees
        freelancer_account_id = data.get("freelancer_account_id")
        currency = data.get("currency", "usd")

        if not amount or not freelancer_account_id:
            return jsonify({"error": "Amount and freelancer account ID are required"}), 400

        transfer = stripe_manager.transfer_to_freelancer(
            amount=int(amount), freelancer_account_id=freelancer_account_id, currency=currency
        )
        return jsonify({"transfer": transfer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
