from django.contrib import admin
from .models import Post, Profile, PostImage, PostFile


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 0


class PostFileInline(admin.TabularInline):
    model = PostFile
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'published', 'created_at')
    list_filter = ('published', 'created_at')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PostImageInline, PostFileInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'location')
