from django.urls import path
from rest_framework.authtoken import views
from .views import UserRegistration

urlpatterns = [
    path('signup', UserRegistration.as_view(), name='registration'),
    path('api-token-auth/', views.obtain_auth_token)
]
