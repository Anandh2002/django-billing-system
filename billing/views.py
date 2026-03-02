import math
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages

from .models import Product, Purchase, PurchaseItem

from django.core.mail import send_mail
from django.template.loader import render_to_string


DENOMINATIONS = [500, 50, 20, 10, 5, 2, 1]


def calculate_change_denominations(balance_amount):
    result = {}
    remaining = int(balance_amount)
    for denom in DENOMINATIONS:
        if remaining <= 0:
            break
        count = remaining // denom
        if count > 0:
            result[str(denom)] = count
            remaining = remaining - (count * denom)
    return result


def billing_page(request):
    if request.method == 'POST':
        return process_bill(request)

    return render(request, 'billing/billing_page.html', {
        'denominations': DENOMINATIONS
    })


def process_bill(request):
    customer_email = request.POST.get('customer_email', '').strip()
    product_ids = request.POST.getlist('product_id')
    quantities = request.POST.getlist('quantity')

    errors = []

    if not customer_email:
        errors.append('Please enter customer email.')

    
    bill_items = []
    for i in range(len(product_ids)):
        pid = product_ids[i].strip()
        if pid == '':
            continue

        try:
            qty = int(quantities[i])
            if qty <= 0:
                raise ValueError
        except (ValueError, IndexError):
            errors.append('Invalid quantity for product ' + pid)
            continue

        try:
            product = Product.objects.get(product_id=pid)
        except Product.DoesNotExist:
            errors.append('Product not found: ' + pid)
            continue

        if product.available_stocks < qty:
            errors.append('Not enough stock for ' + pid + '. Available: ' + str(product.available_stocks))
            continue

        bill_items.append({
            'product': product,
            'qty': qty
        })

    if len(bill_items) == 0:
        errors.append('Please add at least one product.')

    try:
        cash_paid = float(request.POST.get('cash_paid') or 0)
    except ValueError:
        cash_paid = 0
        errors.append('Invalid cash amount.')

    # collect denomination counts
    denom_received = {}
    for d in DENOMINATIONS:
        val = request.POST.get('denom_' + str(d), '').strip()
        if val != '':
            try:
                c = int(val)
                if c > 0:
                    denom_received[str(d)] = c
            except ValueError:
                pass

    if len(errors) > 0:
        for e in errors:
            messages.error(request, e)
        return render(request, 'billing/billing_page.html', {
            'denominations': DENOMINATIONS,
            'post_data': request.POST
        })

    
    total_without_tax = 0
    total_tax = 0

    for item in bill_items:
        p = item['product']
        qty = item['qty']
        line_price = p.price * qty
        line_tax = line_price * (p.tax_percentage / 100)
        total_without_tax = total_without_tax + line_price
        total_tax = total_tax + line_tax

    net_price = total_without_tax + total_tax
    rounded_net = math.floor(net_price)
    balance = cash_paid - rounded_net

    denom_returned = calculate_change_denominations(max(balance, 0))

    # save purchase to database
    purchase = Purchase.objects.create(
        customer_email=customer_email,
        total_without_tax=round(total_without_tax, 2),
        total_tax=round(total_tax, 2),
        net_price=round(net_price, 2),
        rounded_net_price=rounded_net,
        cash_paid=cash_paid,
        balance=round(balance, 2),
        denom_received=denom_received,
        denom_returned=denom_returned,
    )

    for item in bill_items:
        p = item['product']
        PurchaseItem.objects.create(
            purchase=purchase,
            product=p,
            quantity=item['qty'],
            unit_price=p.price,
            tax_percentage=p.tax_percentage,
        )
        # reduce stock
        p.available_stocks = p.available_stocks - item['qty']
        p.save()

   
    items = purchase.items.select_related('product').all()
    subject = 'Invoice #' + str(purchase.id)
    html_body = render_to_string('billing/email_invoice.html', {'purchase': purchase, 'items': items})
    text_body = render_to_string('billing/email_invoice_plain.txt', {'purchase': purchase, 'items': items})
    send_mail(subject, '', None, [purchase.customer_email], html_message=html_body)

    return redirect('bill_detail', pk=purchase.pk)


def bill_detail(request, pk):
    purchase = get_object_or_404(Purchase, pk=pk)
    items = purchase.items.all()
    return render(request, 'billing/bill_detail.html', {
        'purchase': purchase,
        'items': items
    })


def purchase_history(request):
    all_purchases = Purchase.objects.all()

    selected_purchase = None
    selected_id = request.GET.get('purchase')
    if selected_id:
        try:
            selected_purchase = Purchase.objects.get(pk=selected_id)
        except Purchase.DoesNotExist:
            pass

    return render(request, 'billing/purchase_history.html', {
        'purchases': all_purchases,
        'selected_purchase': selected_purchase,
    })



