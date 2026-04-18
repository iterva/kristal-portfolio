from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import Profile


class Command(BaseCommand):
    help = 'Create the initial admin user for the portfolio'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True)
        parser.add_argument('--password', type=str, required=True)
        parser.add_argument('--first-name', type=str, default='Kristal')
        parser.add_argument('--last-name', type=str, default='')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists.'))
            return

        username = email.split('@')[0]
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
        )
        Profile.objects.create(
            user=user,
            title='Desarrolladora de Software',
        )
        self.stdout.write(self.style.SUCCESS(f'User {email} created successfully.'))
