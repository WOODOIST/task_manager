from django.contrib import admin
from django.urls import path, include
from . import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include("task_manager_main.urls")),
    path('api/', include('task_manager_main.api.urls'))
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
