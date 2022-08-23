from rest_framework.serializers import ModelSerializer
from .models import Payment, PaymentHistory
from subscriptions.serializers import SubscriptionPlanSerializer


class PaymentSerializer(ModelSerializer):
    """Payment Serializer"""

    class Meta:
        model = Payment
        fields = [
            'created_at',
            'amount',
        ]
        
        
class PaymentHistorySerializer(ModelSerializer):
    """PaymentHistory Serializer"""

    class Meta:
        model = PaymentHistory
        fields = [
            # 'user',
            'payments'
        ]
        # payments = PaymentSerializer(many=True)
    def to_representation(self, instance):
        return {
            # 'user': instance.user.id,
            'payments': [PaymentSerializer(payment).data for payment in instance.payments.all()]
        }