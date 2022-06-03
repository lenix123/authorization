from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('signup/', UserRegistration.as_view(), name='registration'),
    path('signin/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send_confirm_email/', EmailActivationSender.as_view(), name='email_confirm_sender'),
    path('change_email/', ChangeUserEmail.as_view(), name='change_email'),
    path('set_recovery_email/', SetRecoveryEmail.as_view(), name='set_recovery_email'),
    path('activate_recovery_email/<str:uidb64>/<str:token>/', ActivateRecoveryEmail.as_view()),
    path('change_password/', ChangePassword.as_view(), name='change_password'),
    path('enable_two_factor_auth/', EnableTwoFacAuth.as_view(), name='enable_two_factor_auth'),
    path('disable_two_factor_auth/', DisableTwoFactorAuth.as_view(), name='disable_two_factor_auth'),
    path('verify_two_factor_code/', VerifyTwoFactorCode.as_view(), name='verify_two_factor_code'),
    path('user_profile/', UserProfile.as_view(), name='user_profile'),
    path('accounts/activate/<str:uidb64>/<str:token>/', ActivateAccount.as_view(), name='activate'),
    path('accounts/password_reset/', ResetPassword.as_view(), name='reset_password'),
    path('accounts/password_reset_confirm/<str:uidb64>/<str:token>/', ResetPasswordConfirm.as_view())
]
