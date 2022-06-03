import pyotp
import threading
from ..models import User
from .serializers import UserSerializer, EmailSerializer, ResetPasswordSerializer, ChangeEmailSerializer, \
    ChangePasswordSerializer, MyTokenObtainPairSerializer, ConfirmAccessSerializer, TwoFactorCodeSerializer
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils import account_activation_token
from django.contrib.auth.tokens import default_token_generator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_text, force_bytes
from django.template.loader import render_to_string
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.mail import EmailMessage


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['user_name'] = user.first_name

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def retrieve_user(uidb64):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        return User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None


class UserRegistration(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserProfile(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_object(self):
        user = self.request.user
        return user


# send a email to a new user
@receiver(post_save, sender=User)
def send_email_to_new_user(instance=None, created=False, **kwargs):
    if instance and created:
        send_email(instance, action="activate_account")


class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        try:
            two_fac_access_token = serializer.validated_data["two_fac_access_token"]
        except KeyError:
            return Response(serializer.validated_data, status=status.HTTP_200_OK)

        if two_fac_access_token:
            return Response({"two_factor_access_token": two_fac_access_token}, status=status.HTTP_202_ACCEPTED)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class EmailActivationSender(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.initial_data['email']
            try:
                user = User.objects.get(email=email)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'user with this email is not found'}, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_email_verified:
                send_email(user, action="activate_account")
                return Response({'activation email was sent'}, status=status.HTTP_200_OK)

            return Response({"user's email have been already activated"}, status=status.HTTP_400_BAD_REQUEST)


class ActivateAccount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token, format=None):
        user = retrieve_user(uidb64)
        if user is not None and account_activation_token.check_token(user, token):
            new_email = user.email_to_change
            if new_email and not User.objects.filter(email=new_email).exists():
                user.email = new_email
                user.email_to_change = ""
            else:
                send_email(user, "created_account")

            user.is_email_verified = True
            user.save()

            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_201_CREATED)

        content = {'Something wrong with your url'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)


class ResetPassword(generics.CreateAPIView):
    serializer_class = EmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.initial_data["email"]
            message = {'If an account exists you will get an email with instructions on resetting your password'}
            try:
                user = User.objects.get(email=email)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(message, status=status.HTTP_200_OK)

            send_email(user, action="reset_password")
            return Response(message, status=status.HTTP_200_OK)


def send_email(user, action, token=None, email=None):
    if action == "activate_account":
        email_subject = "Activate your account"
        email_template = "email_confirmation_template.html"
        token = account_activation_token.make_token(user)
    elif action == "reset_password":
        email_subject = "Reset password"
        email_template = "email_reset_password.html"
        token = default_token_generator.make_token(user)
    elif action == "reset_password_notification":
        email_subject = "Security notification"
        email_template = "email_reset_pass_notification.html"
    elif action == "set_recovery_email":
        email_subject = "Set recovery email"
        email_template = "email_set_recovery_email.html"
        token = default_token_generator.make_token(user)
    else:
        email_subject = "Account was created"
        email_template = "email_account_created.html"

    email_body = render_to_string(email_template, {
        "user_name": user.first_name,
        "domain": "localhost:3000",
        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
        'token': token
    })

    to = email if email else user.email

    # async sending an email
    EmailThread(email_subject, email_body, (to,)).start()


class EmailThread(threading.Thread):
    def __init__(self, subject, body, to):
        self.subject = subject
        self.to = to
        self.body = body
        threading.Thread.__init__(self)

    def run(self):
        msg = EmailMessage(subject=self.subject, body=self.body, to=self.to)
        msg.send()


class ResetPasswordConfirm(generics.CreateAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        uidb64 = self.kwargs.get("uidb64")
        user = retrieve_user(uidb64)

        token = self.kwargs.get("token")
        if user is not None and default_token_generator.check_token(user, token):
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                password = serializer.initial_data["new_password"]
                user.set_password(password)
                user.save()

                send_email(user, 'reset_password_notification')
                return Response({'Password was changed'}, status=status.HTTP_201_CREATED)

        content = {'Something wrong with your url'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)


class ChangeUserEmail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangeEmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = request.user

            if not user:
                return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

            if user.check_password(serializer.initial_data["password"]):
                new_email = serializer.initial_data["new_email"]
                if User.objects.filter(email=new_email).exists():
                    return Response({'detail': 'Email address already in use'}, status=status.HTTP_400_BAD_REQUEST)

                user.email_to_change = new_email
                user.save()
                send_email(user, action="activate_account", email=new_email)
                return Response({'detail': 'Check your email box'}, status=status.HTTP_200_OK)

            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


class SetRecoveryEmail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = request.user
            if not user:
                return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

            user.recovery_email = serializer.initial_data["email"]
            user.is_recovery_email_verified = False
            user.save()
            user_serializer = UserSerializer(user)
            send_email(user, action="set_recovery_email", email=user.recovery_email)
            return Response(user_serializer.data, status=status.HTTP_200_OK)


class ActivateRecoveryEmail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uidb64 = self.kwargs.get("uidb64")
        user = retrieve_user(uidb64)
        authenticated_user = request.user

        token = self.kwargs.get("token")
        if user is not None and user == authenticated_user and default_token_generator.check_token(user, token):
            user.is_recovery_email_verified = True
            user.save()
            return Response({'detail': 'Recovery email was set'}, status=status.HTTP_201_CREATED)

        return Response({'detail': 'Something wrong with your url'}, status=status.HTTP_400_BAD_REQUEST)


class ChangePassword(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = request.user
            if not user:
                return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

            new_password = serializer.initial_data["new_password"]
            if not user.check_password(serializer.initial_data["old_password"]):
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

            if new_password != serializer.initial_data["confirm_new_password"]:
                return Response({'detail': 'The passwords mismatch'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'Password was changed'}, status=status.HTTP_200_OK)


class EnableTwoFacAuth(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ConfirmAccessSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = request.user

            if not user:
                return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

            password = serializer.initial_data["password"]
            if not user.check_password(password):
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

            if user.is_two_fac_auth_enabled:
                return Response({'detail': 'The user have already enabled two-factor authentication'},
                                status=status.HTTP_400_BAD_REQUEST)

            user.otp_secret = pyotp.random_base32()
            user.save()

            secret_url = self.get_secret_url(user)
            return Response({'secret_url': secret_url, 'otp_secret': user.otp_secret}, status=status.HTTP_200_OK)

    def get_secret_url(self, user):
        otp_secret = user.otp_secret

        secret_url = ''
        if otp_secret:
            secret_url = pyotp.TOTP(otp_secret).provisioning_uri(user.first_name, issuer_name="Lenix")
        return secret_url


class VerifyTwoFactorCode(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = TwoFactorCodeSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = request.user

            if not user:
                return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

            code = serializer.initial_data["code"]
            if not user.otp_secret:
                return Response({'detail': '2FA not enabled for this user. Please try again.'},
                                status=status.HTTP_400_BAD_REQUEST)

            totp = pyotp.TOTP(user.otp_secret)
            token_valid = totp.verify(code, valid_window=2)
            if not token_valid:
                return Response({'detail': 'Invalid two-factor authentication token. Please try again.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if not user.is_two_fac_auth_enabled:
                user.is_two_fac_auth_enabled = True
                user.save()

            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)


class DisableTwoFactorAuth(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if not user:
            return Response({'detail': 'User is not found'}, status=status.HTTP_401_UNAUTHORIZED)

        user.is_two_fac_auth_enabled = False
        user.otp_secret = ""
        user.save()
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_200_OK)
