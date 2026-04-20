from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import uuid
import os


def post_image_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('posts', 'images', filename)


def post_file_path(instance, filename):
    return os.path.join('posts', 'files', filename)


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to=post_image_path, blank=True, null=True)
    file = models.FileField(upload_to=post_file_path, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.file and not self.file_name:
            self.file_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='profile/', blank=True, null=True)
    github_url = models.CharField(max_length=500, blank=True)
    linkedin_url = models.CharField(max_length=500, blank=True)
    website_url = models.CharField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    title = models.CharField(max_length=200, blank=True, help_text="E.g. Full Stack Developer")
    headline = models.CharField(max_length=300, blank=True, help_text="Hero subtitle for the portfolio home")
    logo = models.ImageField(upload_to='profile/logo/', blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


def profile_photo_path(instance, filename):
    ext = filename.split('.')[-1]
    import uuid
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('profile', 'photos', filename)


class ProfilePhoto(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to=profile_photo_path)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Photo {self.order} of {self.profile.user.username}"


class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=post_image_path)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image {self.order} of {self.post.title}"


class PostFile(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=post_file_path)
    file_name = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"File {self.file_name} of {self.post.title}"

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)
