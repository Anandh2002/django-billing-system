from django.contrib import admin
from .models import Product, Purchase, PurchaseItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_id', 'name', 'price', 'tax_percentage', 'available_stocks')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_email', 'net_price', 'cash_paid', 'balance', 'created_at')


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'product', 'quantity', 'unit_price', 'tax_percentage')