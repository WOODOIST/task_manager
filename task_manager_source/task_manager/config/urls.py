from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('taskmanager/', include("task_manager_main.urls")),
    path('api/', include('task_manager_main.api.urls'))
]
