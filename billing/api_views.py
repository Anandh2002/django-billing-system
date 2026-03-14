from rest_framework import viewsets,status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import ProductSerializer,PurchaseSerializer
from .views import process_bill,DENOMINATIONS, calculate_change_denominations
import math
from django.core.mail import send_mail
from django.template.loader import render_to_string


class ProductViewSet(viewsets.ModelViewSet):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset=Purchase.objects.all()
    serializer_class=PurchaseSerializer

@api_view(['POST'])

def api_generate_bill(request):
    customer_email = request.data.get('customer_email', '').strip()
    products       = request.data.get('products', [])  # [{product_id, quantity}]
    denominations  = request.data.get('denominations', {})  # {500: 2, 50: 1}
    cash_paid      = request.data.get('cash_paid', 0)

    errors = []
    if not customer_email:
        errors.append('Customer email is required')
    if not products:
        errors.append('Add at least one product')
    if errors:
        return Response({'errors': errors}, status=400)
    
    bill_items = []
    for item in products:
        pid = item.get('product_id', '').strip()
        qty = int(item.get('quantity', 0))
        try:
            product = Product.objects.get(product_id=pid)
        except Product.DoesNotExist:
            return Response({'errors': [f'Product {pid} not found']}, status=400)
        if product.available_stocks < qty:
            return Response({'errors': [f'Not enough stock for {pid}']}, status=400)
        bill_items.append({'product': product, 'qty': qty})

    
    total_without_tax = 0
    total_tax         = 0
    for item in bill_items:
        p   = item['product']
        qty = item['qty']
        line_total     = p.price * qty
        tax_amount     = line_total * p.tax_percentage / 100
        total_without_tax += line_total
        total_tax         += tax_amount

    net_price     = total_without_tax + total_tax
    rounded_net   = math.floor(net_price)
    balance       = float(cash_paid) - rounded_net
    denom_received = {str(k): int(v) for k, v in denominations.items()}
    denom_returned = calculate_change_denominations(max(balance, 0))

    purchase = Purchase.objects.create(
        customer_email   = customer_email,
        total_without_tax= round(total_without_tax, 2),
        total_tax        = round(total_tax, 2),
        net_price        = round(net_price, 2),
        rounded_net_price= rounded_net,
        cash_paid        = float(cash_paid),
        balance          = round(balance, 2),
        denom_received   = denom_received,
        denom_returned   = denom_returned,
    )

    for item in bill_items:
        p = item['product']
        PurchaseItem.objects.create(
            purchase       = purchase,
            product        = p,
            quantity       = item['qty'],
            unit_price     = p.price,
            tax_percentage = p.tax_percentage,
        )
        p.available_stocks -= item['qty']
        p.save()

    try:
        items = purchase.items.select_related('product').all()
        subject   = 'Invoice #' + str(purchase.id)
        html_body = render_to_string('billing/email_invoice.html',
                                     {'purchase': purchase, 'items': items})
        text_body = render_to_string('billing/email_invoice_plain.txt',
                                     {'purchase': purchase, 'items': items})
        send_mail(subject, text_body, None,
                  [purchase.customer_email], html_message=html_body)
    except Exception:
        pass

    serializer = PurchaseSerializer(purchase)
    return Response(serializer.data, status=201)


