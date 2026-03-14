from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('billing.urls')),
    path('api/',   include('billing.api_urls')),
]
