from django.urls import include, path
from rest_framework import routers
from .viewsets import *

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'profile', ProfileViewSet, basename='profiles')
router.register(r'status', StatusViewSet, basename='statuses')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'files', FileViewSet, basename='files')

urlpatterns = [
    path('', include(router.urls)),
]

