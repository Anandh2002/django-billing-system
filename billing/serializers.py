from rest_framework import serializers
from .models import *


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields= ['id', 'product_id', 'name', 'available_stocks',
                  'price', 'tax_percentage']



class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name=serializers.CharField(source='product.name',read_only=True)
    line_total=serializers.SerializerMethodField()
    tax_amount=serializers.SerializerMethodField()
    

    class Meta:
        model=PurchaseItem
        fields=['id', 'product_id', 'product_name', 'quantity',
                  'unit_price', 'tax_percentage', 'line_total', 'tax_amount']

    def get_line_total(self,obj):
        return obj.get_line_total()

    def get_tax_amount(self,obj):
        return obj.get_tax_amount()


class PurchaseSerializer(serializers.ModelSerializer):
    items=PurchaseItemSerializer(many=True,read_only=True)

    class Meta:
        model=Purchase
        fields=['id', 'customer_email', 'total_without_tax', 'total_tax',
                  'net_price', 'rounded_net_price', 'cash_paid', 'balance',
                  'denom_received', 'denom_returned', 'created_at', 'items']
