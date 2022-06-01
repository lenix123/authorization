from rest_framework import serializers, exceptions
from users.models import User
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import update_last_login


class PasswordField(serializers.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("style", {})

        kwargs["style"]["input_type"] = "password"
        kwargs["write_only"] = True

        super().__init__()


class MyTokenObtainPairSerializer(TokenObtainSerializer):
    token_class = RefreshToken

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['user_name'] = user.first_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_email_verified:
            raise exceptions.PermissionDenied("email address is not verified")

        refresh = self.get_token(self.user)

        if self.user.is_two_fac_auth_enabled:
            return {"two_fac_access_token": str(refresh.access_token)}

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'recovery_email', 'is_recovery_email_verified',
                  'is_two_fac_auth_enabled')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_blank=True)


class ChangeEmailSerializer(serializers.Serializer):
    new_email = serializers.EmailField()
    password = PasswordField()


class ResetPasswordSerializer(serializers.Serializer):
    new_password = PasswordField()
    confirm_password = PasswordField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = PasswordField()
    new_password = PasswordField()
    confirm_new_password = PasswordField()


class ConfirmAccessSerializer(serializers.Serializer):
    password = PasswordField()


class TwoFactorCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
