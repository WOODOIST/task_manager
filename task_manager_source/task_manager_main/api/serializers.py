from django.contrib.auth.models import User
from rest_framework import serializers
from task_manager_main.models import *


class StatusSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Status
		fields = ["id", "name", "color"]


class ProfileSerializer(serializers.ModelSerializer):
	class Meta: 
		model = Profile
		fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
	profile = ProfileSerializer(read_only=False)
	class Meta:
		model = User
		fields = '__all__'
	

class TaskSerializer(serializers.ModelSerializer):
	author = UserSerializer(read_only=False)
	performer = UserSerializer(read_only=False)
	status = StatusSerializer(read_only=False)

	class Meta:
		model = Task
		fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
	task = TaskSerializer(read_only=False)
	user = UserSerializer(read_only=False)

	class Meta:
		model = Comment
		fields = '__all__'

class FileSerializer(serializers.ModelSerializer):
	task = TaskSerializer(read_only=False)

	class Meta:
		model = File
		fields = '__all__'

class TasksGraphSerializer(serializers.ModelSerializer):
	task = TaskSerializer(read_only=False)

	class Meta:
		model = TasksGraph
		fields = '__all__'