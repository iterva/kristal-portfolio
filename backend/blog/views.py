from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import cloudinary.uploader
from .models import Post, Profile, ProfilePhoto, PostImage, PostFile
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateSerializer,
    ProfileSerializer, AuthorSerializer, PostImageSerializer, PostFileSerializer,
)



class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Post.objects.all()
        return Post.objects.filter(published=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email y contraseña son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Credenciales inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    user = authenticate(username=user.username, password=password)
    if user is None:
        return Response(
            {'error': 'Credenciales inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Sesión cerrada.'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def profile_view(request):
    """Public profile info for the portfolio owner."""
    try:
        user = User.objects.get(is_staff=True)
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response({
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'profile': ProfileSerializer(profile, context={'request': request}).data,
        })
    except User.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=404)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    # Extract user fields before passing to serializer
    profile_data = {}
    for key in ['bio', 'title', 'headline', 'location', 'github_url', 'linkedin_url', 'website_url']:
        if key in request.data:
            profile_data[key] = request.data[key]
    serializer = ProfileSerializer(profile, data=profile_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # Update user name
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        request.user.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_profile_photo(request):
    """Upload a presentation photo (max 4)."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if profile.photos.count() >= 4:
        return Response(
            {'error': 'Máximo 4 fotos de presentación.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'No se envió imagen.'}, status=400)
    order = profile.photos.count()
    photo = ProfilePhoto.objects.create(profile=profile, image=image, order=order)
    return Response({
        'id': photo.id,
        'image_url': request.build_absolute_uri(photo.image.url),
        'order': photo.order,
    }, status=201)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_profile_photo(request, photo_id):
    """Delete a presentation photo."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    try:
        photo = profile.photos.get(id=photo_id)
        photo.image.delete()
        photo.delete()
        return Response({'message': 'Foto eliminada.'}, status=200)
    except ProfilePhoto.DoesNotExist:
        return Response({'error': 'Foto no encontrada.'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_logo(request):
    """Upload a logo for the navbar."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    image = request.FILES.get('logo')
    if not image:
        return Response({'error': 'No se envió imagen.'}, status=400)
    # Delete old logo if exists
    if profile.logo:
        profile.logo.delete()
    profile.logo = image
    profile.save()
    return Response({
        'logo_url': request.build_absolute_uri(profile.logo.url),
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_logo(request):
    """Remove the logo."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if profile.logo:
        profile.logo.delete()
        profile.logo = None
        profile.save()
    return Response({'message': 'Logo eliminado.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_post_images(request, slug):
    """Upload one or more images/videos to a post via Cloudinary."""
    try:
        post = Post.objects.get(slug=slug, author=request.user)
    except Post.DoesNotExist:
        return Response({'error': 'Post no encontrado.'}, status=404)
    images = request.FILES.getlist('images')
    if not images:
        return Response({'error': 'No se enviaron imágenes.'}, status=400)
    order = post.images.count()
    created = []
    for img in images:
        result = cloudinary.uploader.upload(img, resource_type='auto', folder='posts/images')
        pi = PostImage.objects.create(
            post=post,
            image_url=result['secure_url'],
            public_id=result['public_id'],
            resource_type=result.get('resource_type', 'image'),
            order=order,
        )
        order += 1
        created.append(pi)
    serializer = PostImageSerializer(created, many=True)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_post_image(request, slug, image_id):
    """Delete an image from a post and Cloudinary."""
    try:
        post = Post.objects.get(slug=slug, author=request.user)
    except Post.DoesNotExist:
        return Response({'error': 'Post no encontrado.'}, status=404)
    try:
        img = post.images.get(id=image_id)
        if img.public_id:
            cloudinary.uploader.destroy(img.public_id, resource_type=img.resource_type)
        img.delete()
        return Response({'message': 'Imagen eliminada.'})
    except PostImage.DoesNotExist:
        return Response({'error': 'Imagen no encontrada.'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_post_files(request, slug):
    """Upload one or more files to a post via Cloudinary."""
    try:
        post = Post.objects.get(slug=slug, author=request.user)
    except Post.DoesNotExist:
        return Response({'error': 'Post no encontrado.'}, status=404)
    files = request.FILES.getlist('files')
    if not files:
        return Response({'error': 'No se enviaron archivos.'}, status=400)
    order = post.files.count()
    created = []
    for f in files:
        result = cloudinary.uploader.upload(f, resource_type='raw', folder='posts/files')
        pf = PostFile.objects.create(
            post=post,
            file_url=result['secure_url'],
            public_id=result['public_id'],
            file_name=f.name,
            order=order,
        )
        order += 1
        created.append(pf)
    serializer = PostFileSerializer(created, many=True)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_post_file(request, slug, file_id):
    """Delete a file from a post and Cloudinary."""
    try:
        post = Post.objects.get(slug=slug, author=request.user)
    except Post.DoesNotExist:
        return Response({'error': 'Post no encontrado.'}, status=404)
    try:
        pf = post.files.get(id=file_id)
        if pf.public_id:
            cloudinary.uploader.destroy(pf.public_id, resource_type='raw')
        pf.delete()
        return Response({'message': 'Archivo eliminado.'})
    except PostFile.DoesNotExist:
        return Response({'error': 'Archivo no encontrado.'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Get current user info."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response({
        'id': request.user.id,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'profile': ProfileSerializer(profile).data,
    })
