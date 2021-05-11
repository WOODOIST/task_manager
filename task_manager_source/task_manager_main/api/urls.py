from django.db.models import base
from django.urls import include, path
from rest_framework import routers
from .viewsets import *

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profile', ProfileViewSet)
router.register(r'status', StatusViewSet, basename="statuses")
router.register(r'tasks', TaskViewSet, basename="tasks")

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('data/', include('rest_framework.urls', namespace='rest_framework'))
]