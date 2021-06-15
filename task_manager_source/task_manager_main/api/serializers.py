from django.contrib.auth.models import User
from rest_framework import serializers
from task_manager_main.models import *


class StatusSerializer(serializers.ModelSerializer):
	class Meta:
		model = Status
		fields = ("id", "name", "color")


class ProfileSerializer(serializers.ModelSerializer):
	class Meta: 
		model = Profile
		fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
	profile = ProfileSerializer(read_only=False)
	class Meta:
		model = User
		fields = ('id', 'username', 'profile')
	

class TaskSerializer(serializers.ModelSerializer):
	author = UserSerializer(read_only=False)
	performer = UserSerializer(read_only=False)
	status = StatusSerializer(read_only=False)

	class Meta:
		model = Task
		fields = '__all__'

class FileSerializer(serializers.ModelSerializer):
	task = TaskSerializer(read_only=False)

	class Meta:
		model = File
		fields = ('id', 'task', 'filename', 'file')
