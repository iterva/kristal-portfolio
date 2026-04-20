from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')

urlpatterns = [
    path('cloudinary/sign/', views.cloudinary_sign, name='cloudinary-sign'),
    path('posts/<slug:slug>/images/', views.upload_post_images, name='post-images-upload'),
    path('posts/<slug:slug>/images/register/', views.register_post_images, name='post-images-register'),
    path('posts/<slug:slug>/images/<int:image_id>/', views.delete_post_image, name='post-image-delete'),
    path('posts/<slug:slug>/files/', views.upload_post_files, name='post-files-upload'),
    path('posts/<slug:slug>/files/register/', views.register_post_files, name='post-files-register'),
    path('posts/<slug:slug>/files/<int:file_id>/', views.delete_post_file, name='post-file-delete'),
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='profile-update'),
    path('profile/photos/', views.upload_profile_photo, name='profile-photo-upload'),
    path('profile/photos/<int:photo_id>/', views.delete_profile_photo, name='profile-photo-delete'),
    path('profile/logo/', views.upload_logo, name='profile-logo-upload'),
    path('profile/logo/delete/', views.delete_logo, name='profile-logo-delete'),
]
