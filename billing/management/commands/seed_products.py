from django.core.management.base import BaseCommand
from billing.models import Product


class Command(BaseCommand):
    help = 'Add some sample products to the database'

    def handle(self, *args, **kwargs):
        products = [
            ('P001', 'Apple',         100, 50.0,  5.0),
            ('P002', 'Banana',        200, 20.0,  5.0),
            ('P003', 'Chocolate Bar',  50, 80.0, 12.0),
            ('P004', 'Rice 1kg',      150, 60.0,  0.0),
            ('P005', 'Cooking Oil',    80, 150.0, 5.0),
            ('P006', 'Biscuits',      120, 30.0, 12.0),
            ('P007', 'Milk 500ml',     60, 25.0,  0.0),
            ('P008', 'Bread',          40, 45.0,  0.0),
            ('P009', 'Sugar 1kg',      90, 40.0,  0.0),
            ('P010', 'Tea Powder',     70, 120.0, 5.0),
        ]

        for pid, name, stock, price, tax in products:
            obj, created = Product.objects.update_or_create(
                product_id=pid,
                defaults={
                    'name': name,
                    'available_stocks': stock,
                    'price': price,
                    'tax_percentage': tax
                }
            )
            if created:
                self.stdout.write('Created: ' + str(obj))
            else:
                self.stdout.write('Already exists, updated: ' + str(obj))

        self.stdout.write(self.style.SUCCESS('Products loaded successfully!'))
