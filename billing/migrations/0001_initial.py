from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_id', models.CharField(max_length=50, unique=True)),
                ('name', models.CharField(max_length=200)),
                ('available_stocks', models.PositiveIntegerField(default=0)),
                ('price', models.FloatField()),
                ('tax_percentage', models.FloatField(default=0)),
            ],
            options={'ordering': ['product_id']},
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_email', models.EmailField(max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('total_without_tax', models.FloatField(default=0)),
                ('total_tax', models.FloatField(default=0)),
                ('net_price', models.FloatField(default=0)),
                ('rounded_net_price', models.FloatField(default=0)),
                ('cash_paid', models.FloatField(default=0)),
                ('balance', models.FloatField(default=0)),
                ('denom_received', models.JSONField(default=dict)),
                ('denom_returned', models.JSONField(default=dict)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='PurchaseItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price', models.FloatField()),
                ('tax_percentage', models.FloatField()),
                ('purchase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='billing.purchase')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='billing.product')),
            ],
        ),
    ]
