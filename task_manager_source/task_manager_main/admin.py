from django import forms
from django.contrib import admin
from django.contrib.admin.decorators import register
from django.forms.widgets import FileInput
from .models import Profile, File
from django.db import models

@register(Profile)
class UserProfile(admin.ModelAdmin):
	pass

@register(File)
class FileAdmin(admin.ModelAdmin):
	pass
# Register your models here.
