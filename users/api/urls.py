from django.urls import path
from .views import UserRegistration, MyTokenObtainPairView, EmailActivationSender
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('signup/', UserRegistration.as_view(), name='registration'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send_confirm_email/', EmailActivationSender.as_view(), name='email_confirm_sender'),
]
