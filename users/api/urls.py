from django.urls import path
from .views import UserRegistration, MyTokenObtainPairView, EmailActivationSender, UserProfile, ActivateAccount,\
    ResetPassword, ResetPasswordConfirm
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('signup/', UserRegistration.as_view(), name='registration'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send_confirm_email/', EmailActivationSender.as_view(), name='email_confirm_sender'),
    path('user_profile/<int:pk>/', UserProfile.as_view(), name='user_profile'),
    path('accounts/activate/<str:uidb64>/<str:token>/', ActivateAccount.as_view(), name='activate'),
    path('accounts/password_reset/', ResetPassword.as_view(), name='reset_password'),
    path('accounts/password_reset_confirm/<str:uidb64>/<str:token>/', ResetPasswordConfirm.as_view())
]
