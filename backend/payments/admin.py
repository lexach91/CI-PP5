from django.contrib import admin
from .models import Payment, PaymentHistory


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('membership', 'amount', 'created_at')
    
@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'Amount_of_payments')
    
    def Amount_of_payments(self, obj):
        return obj.payments.count()