from rest_framework.serializers import ModelSerializer
from .models import Payment, PaymentHistory


class PaymentSerializer(ModelSerializer):
    """Payment Serializer"""

    class Meta:
        model = Payment
        fields = [
            "created_at",
            "amount",
        ]


class PaymentHistorySerializer(ModelSerializer):
    """PaymentHistory Serializer"""

    class Meta:
        model = PaymentHistory
        fields = ["payments"]

    def to_representation(self, instance):
        return {
            "payments": [
                PaymentSerializer(payment).data
                for payment in instance.payments.all()
            ]
        }
