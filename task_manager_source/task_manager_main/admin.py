from django.contrib import admin
from django.contrib.admin.decorators import register
from .models import Profile, File, Status

@register(Profile)
class UserProfile(admin.ModelAdmin):
	pass

@register(File)
class FileAdmin(admin.ModelAdmin):
	pass

@register(Status)
class StatusAdmin(admin.ModelAdmin):
	pass
