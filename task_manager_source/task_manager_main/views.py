from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.signals import user_logged_in
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template import loader
from django.contrib.auth.models import User
import json

def index(request):
	return render(request, 'index.html')


def try_to_authenticate(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		try:
			username = data['username']
			password_raw = data['password']
			
			user = authenticate(username=username, password=password_raw)
			if user is not None:
				login(request, user)
				return HttpResponse(status=200)
			else:
				return HttpResponse(status=404)
		except KeyError as e:
			return HttpResponse(status=400)
	return HttpResponse(status=403)
# Create your views here.

def get_current_user(request):
	if request.user.is_authenticated:
		return JsonResponse({'data':request.user.profile.__str__()})
	else:
		return HttpResponse(status=403)

def try_to_logout(request):
	if request.user.is_authenticated:
		logout(request)
		return HttpResponse(status=200)
	else:
		return HttpResponse(status=404)
