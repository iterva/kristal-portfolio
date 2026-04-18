from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Profile, ProfilePhoto


class ProfilePhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProfilePhoto
        fields = ['id', 'image_url', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ProfileSerializer(serializers.ModelSerializer):
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()
    github_url = serializers.CharField(required=False, allow_blank=True)
    linkedin_url = serializers.CharField(required=False, allow_blank=True)
    website_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = ['bio', 'avatar', 'github_url', 'linkedin_url', 'website_url', 'location', 'title', 'headline', 'photos', 'logo_url']

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class AuthorSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile']


class PostListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'image_url',
            'tags_list', 'author_name', 'published', 'created_at', 'updated_at',
            'file_name',
        ]

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_tags_list(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'image_url',
            'file_url', 'file_name', 'tags_list', 'author', 'published',
            'created_at', 'updated_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_tags_list(self, obj):
        if obj.tags:
            return [t.strip() for t in obj.tags.split(',') if t.strip()]
        return []


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'excerpt', 'content', 'image', 'file', 'tags', 'published']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
