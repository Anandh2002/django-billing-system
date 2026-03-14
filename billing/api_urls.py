from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .api_views import ProductViewSet,PurchaseViewSet,api_generate_bill


router=DefaultRouter()
router.register('products',ProductViewSet)
router.register('purchases',PurchaseViewSet)


urlpatterns=[
    path('',include(router.urls)),
    path('generate-bill/', api_generate_bill),

]