from django.db import models


# this table stores all the products in the shop
class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    available_stocks = models.PositiveIntegerField(default=0)
    price = models.FloatField()
    tax_percentage = models.FloatField(default=0)

    def __str__(self):
        return self.product_id + ' - ' + self.name

    class Meta:
        ordering = ['product_id']


# one Purchase = one bill/transaction
class Purchase(models.Model):
    customer_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    total_without_tax = models.FloatField(default=0)
    total_tax = models.FloatField(default=0)
    net_price = models.FloatField(default=0)
    rounded_net_price = models.FloatField(default=0)
    cash_paid = models.FloatField(default=0)
    balance = models.FloatField(default=0)

    # JSON field to store denomination details
    denom_received = models.JSONField(default=dict)
    denom_returned = models.JSONField(default=dict)

    def __str__(self):
        return 'Purchase #' + str(self.id) + ' - ' + self.customer_email

    class Meta:
        ordering = ['-created_at']


# each product row inside a bill
class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.FloatField()       # saved at time of purchase
    tax_percentage = models.FloatField()   # saved at time of purchase

    def get_line_total_before_tax(self):
        return self.unit_price * self.quantity

    def get_tax_amount(self):
        return self.get_line_total_before_tax() * (self.tax_percentage / 100)

    def get_line_total(self):
        return self.get_line_total_before_tax() + self.get_tax_amount()

    def __str__(self):
        return self.product.product_id + ' x' + str(self.quantity)
