from django.contrib.auth.models import User
from django.db.models import query
from task_manager_main.models import *
from rest_framework import generics, viewsets
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

class TaskViewSet(viewsets.ModelViewSet):
	serializer_class = TaskSerializer
	queryset = Task.objects.all().order_by('id')
	filter_fields = {
		'id':['exact'],
		'task_name':['exact'],
		'author__profile__second_name':['exact'],
		'performer__profile__second_name':['exact'],
		'date_begin':['date__range'],
		'status__name':['exact'],
		'date_of_creation':['date__range'],
		'date_end':['date__range']
	}

class FileViewSet(viewsets.ModelViewSet):
	serializer_class = FileSerializer
	queryset = File.objects.all().order_by('id')
	filter_fields = ('id', 'task')