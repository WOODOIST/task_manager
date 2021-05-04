from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('auths_in', views.try_to_authenticate, name="auths"),
]
