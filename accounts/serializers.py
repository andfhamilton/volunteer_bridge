from rest_framework import serializers
from .models import User, Message, Application

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    skills = serializers.JSONField(required=False, allow_null=True)
    interests = serializers.JSONField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 
                 'is_volunteer', 'is_organization', 
                 'phone', 'address', 'bio', 'skills', 
                 'interests')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for profile updates - excludes sensitive fields"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'address', 'bio', 'skills', 'interests')
        read_only_fields = ('id',)

    
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'created_at')

class ApplicationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.SerializerMethodField()
    volunteer_email = serializers.SerializerMethodField()
    opportunity_title = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'volunteer', 'opportunity', 'note', 'status', 
                  'created_at', 'updated_at', 'volunteer_name', 
                  'volunteer_email', 'opportunity_title', 'organization_name']
        read_only_fields = ['volunteer', 'created_at', 'updated_at']
    
    def get_volunteer_name(self, obj):
        return obj.volunteer.username
    
    def get_volunteer_email(self, obj):
        return obj.volunteer.email
    
    def get_opportunity_title(self, obj):
        return obj.opportunity.title
    
    def get_organization_name(self, obj):
        return obj.opportunity.organization.username