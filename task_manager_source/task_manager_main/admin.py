from django.contrib import admin
from django.contrib.admin.decorators import register
from .models import Profile

@register(Profile)
class UserProfile(admin.ModelAdmin):
	pass
# Register your models here.
