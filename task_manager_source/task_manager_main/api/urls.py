from django.db.models import base
from django.urls import include, path
from django.urls.conf import re_path
from rest_framework import routers
from .viewsets import *

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'profile', ProfileViewSet, basename='profiles')
router.register(r'status', StatusViewSet, basename='statuses')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'files', FileViewSet, basename='files')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
]