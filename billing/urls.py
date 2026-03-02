from django.urls import path
from . import views

urlpatterns = [
    path('', views.billing_page, name='billing_page'),
    path('bill/<int:pk>/', views.bill_detail, name='bill_detail'),
    path('history/', views.purchase_history, name='purchase_history'),
]
