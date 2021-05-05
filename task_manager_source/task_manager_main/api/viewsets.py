from django.contrib.auth.models import User
from django.db.models import query
from task_manager_main.models import *
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import *

class UserViewSet(viewsets.ModelViewSet):
	serializer_class = UserSerializer
	queryset = User.objects.all().order_by('id')

class ProfileViewSet(viewsets.ModelViewSet):
	serializer_class = ProfileSerializer
	queryset = Profile.objects.all().order_by('id')

class StatusViewSet(viewsets.ModelViewSet):
	serializer_class = StatusSerializer
	queryset = Status.objects.all().order_by('id')