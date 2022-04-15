from ..models import User
from .serializers import UserSerializer, EmailToActivateSerializer
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from ..utils import account_activation_token
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_text, force_bytes
from django.template.loader import render_to_string
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.mail import EmailMessage


class UserRegistration(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        email = serializer.data['email']
        is_email_verified = User.objects.get(email=email).is_email_verified

        if not is_email_verified:
            return Response({'email address is not confirmed'}, status=status.HTTP_403_FORBIDDEN)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class EmailActivationSender(generics.GenericAPIView):
    serializer_class = EmailToActivateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.data['email']
            try:
                user = User.objects.get(email=email)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'user with this email is not found'}, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_email_verified:
                # there needs to be checker of exceptions!!!
                send_email_activation(user)
                return Response({'activation email was sent'}, status=status.HTTP_200_OK)

            return Response({"user's email have been already activated"}, status=status.HTTP_400_BAD_REQUEST)


def send_email_activation(user):
    user = user
    email_subject = "Activate your account"
    email_body = render_to_string("email_confirmation_template.html", {
        "user_name": user.first_name,
        "domain": "localhost:3000",
        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
    })

    email_msg = EmailMessage(
        subject=email_subject,
        body=email_body,
        to=(user.email, )
    )

    email_msg.send()


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
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(tokens, status=status.HTTP_201_CREATED)
        content = {'Something wrong with your url'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)
