from django.db import migrations


def seed_products(apps, schema_editor):
    Product = apps.get_model('billing', 'Product')

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
        Product.objects.create(
            product_id=pid,
            name=name,
            available_stocks=stock,
            price=price,
            tax_percentage=tax
        )


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_products, migrations.RunPython.noop),
    ]
