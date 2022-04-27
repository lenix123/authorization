from ..models import User
from .serializers import UserSerializer, EmailSerializer, ResetPasswordSerializer
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
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.mail import EmailMessage
import threading


class UserRegistration(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserProfile(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()


@receiver(post_save, sender=User)
def send_email_to_new_user(sender, instance=None, created=False, **kwargs):
    if instance and created:
        send_email(instance, action="activate_account")


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['user_name'] = user.first_name
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        email = serializer.initial_data['email']
        is_email_verified = User.objects.get(email=email).is_email_verified

        if not is_email_verified:
            return Response({'email address is not confirmed'}, status=status.HTTP_403_FORBIDDEN)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class EmailActivationSender(generics.CreateAPIView):
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
                # TODO there needs to be checker of exceptions
                send_email(user, action="activate_account", token=account_activation_token.make_token(user))
                return Response({'activation email was sent'}, status=status.HTTP_200_OK)

            return Response({"user's email have been already activated"}, status=status.HTTP_400_BAD_REQUEST)


class ActivateAccount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token, format=None):
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        if user is not None and account_activation_token.check_token(user, token):
            user.is_email_verified = True
            user.save()

            refresh = RefreshToken.for_user(user=user)
            refresh["user_name"] = user.first_name
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
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
            send_email(email, action="reset_password")
            return Response(message, status=status.HTTP_200_OK)


def send_email(email, action, token=None):
    try:
        user = User.objects.get(email=email)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None

    if action == "activate_account":
        email_subject = "Activate your account"
        email_template = "email_confirmation_template.html"
    elif action == "reset_password":
        email_subject = "Reset password"
        email_template = "email_reset_password.html"
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

    # async sending an email
    EmailThread(email_subject, email_body, (user.email, )).start()


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
        token = self.kwargs.get("token")
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                password = serializer.initial_data["new_password"]
                user.set_password(password)
                user.save()

            # refresh = RefreshToken.for_user(user=user)
            # refresh["user_name"] = user.first_name
            # tokens = {
            #     'refresh': str(refresh),
            #     'access': str(refresh.access_token),
            # }
            return Response({'Password was changed'}, status=status.HTTP_201_CREATED)
        content = {'Something wrong with your url'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)
