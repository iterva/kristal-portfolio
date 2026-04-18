from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')

urlpatterns = [
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
