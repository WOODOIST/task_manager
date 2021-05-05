from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('auths_in', views.try_to_authenticate, name="auths"),
    path('auths_out', views.try_to_logout, name="logouts"),
    path('auths_get', views.get_current_user, name="login"),
]
